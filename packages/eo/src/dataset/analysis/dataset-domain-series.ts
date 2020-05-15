import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import { QueryFilter, Geometry, AoiSupportedGeometry, CancelablePromise, LoadingState } from '@oida/core';
import { hasConfig, hasGeometry } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { isDataProvider } from '../../datasets-explorer/is-data-provider';

import debounce from 'lodash/debounce';

export const DOMAIN_SERIES_TYPE = 'domain_series';
export const TIME_SERIES_TYPE = 'time_series';

export type DatasetVariable<T> = {
    id: string;
    name: string;
    range?: {
        min: T,
        max: T
    };
    noDataValue?: number;
    units?: string;
    description?: string;
};


export type DatasetDomainSeriesRequest<T> = {
    range: {
        start: T;
        end: T;
    },
    variable: string;
    geometry: Geometry;
    filters: QueryFilter[];
};

export type DatasetDomainSeriesItem<T> = {
    x: T;
    y: number;
};

export type DatasetDomainSeriesProvider<T> = (request: DatasetDomainSeriesRequest<T>) => CancelablePromise<DatasetDomainSeriesItem<T>[]>;

export type DatasetDomainSeriesConfig<T = number> = {
    domain: DatasetVariable<T>;
    provider: DatasetDomainSeriesProvider<T>;
    supportedGeometries: AoiSupportedGeometry[],
    variables: DatasetVariable<number>[];
};

const createSeriesType = <T>(typeName: string) => {
    return DatasetViz.addModel(types.compose(
        typeName,
        types.model(typeName, {
            variable: types.maybe(types.string),
            range: types.maybe(types.frozen<{start: T, end: T}>())
        }),
        hasGeometry,
        isDataProvider,
        hasConfig<DatasetDomainSeriesConfig<T>>()
    ).volatile((self) => ({
        data: [] as DatasetDomainSeriesItem<T>[]
    })).actions((self) => {
        return {
            updateData: flow(function*(params: Partial<DatasetDomainSeriesRequest<T>>) {
                try {
                    let {range, geometry, variable, filters} = params;
                    if (range && geometry && variable && filters) {
                        self.data = yield self.startDataRequest(self.config.provider({
                            range, geometry, variable, filters
                        }));
                    } else {
                        self.cancelDataRequest();
                        self.setLoadingState(LoadingState.Init);
                        self.data = [];
                    }
                } catch (e) {
                    self.data = [];
                }
            })
        };
    })
    .actions((self) => {

        const debouncedUpdate = debounce(self.updateData, 1000);

        return {
            setVariable: (variable: string | undefined) => {
                self.variable = variable;
            },
            setRange: (range) => {
                self.range = range;
            },
            afterAttach: () => {

                let seriesUpdateDisposer = autorun(() => {

                    let params = {
                        range: self.range,
                        //@ts-ignore
                        geometry: self.geometry,
                        variable: self.variable,
                        //@ts-ignore
                        filters: self.dataset.searchParams.data.filters
                    };
                    debouncedUpdate(params);

                });

                addDisposer(self, () => {
                    seriesUpdateDisposer();
                });
            }
        };
    }));
};

const DatasetDomainSeriesDecl = createSeriesType<number>(DOMAIN_SERIES_TYPE);

type DatasetDomainSeriesType = typeof DatasetDomainSeriesDecl;
export interface DatasetDomainSeriesInterface extends DatasetDomainSeriesType {}
export const DatasetDomainSeries: DatasetDomainSeriesInterface = DatasetDomainSeriesDecl;
export interface IDatasetDomainSeries extends Instance<DatasetDomainSeriesInterface> {}


const DatasetTimeSeriesDecl = createSeriesType<Date>(TIME_SERIES_TYPE);

type  DatasetTimeSeriesType = typeof  DatasetTimeSeriesDecl;
export interface  DatasetTimeSeriesInterface extends  DatasetTimeSeriesType {}
export const  DatasetTimeSeries:  DatasetTimeSeriesInterface =  DatasetTimeSeriesDecl;
export interface IDatasetTimeSeries extends Instance< DatasetTimeSeriesInterface> {}
