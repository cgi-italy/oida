import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import { QueryFilter, Geometry, GeometryTypes, CancelablePromise, LoadingState } from '@oida/core';
import { needsConfig } from '@oida/state-mst';

import { DatasetAnalysis } from './dataset-analysis';
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
    supportedGeometries: GeometryTypes[],
    variables: DatasetVariable<number>[];
};

const createSeriesType = <T>(typeName: string) => {
    return DatasetAnalysis.addModel(types.compose(
        typeName,
        types.model(typeName, {
            variable: types.maybe(types.string),
            range: types.maybe(types.frozen<{start: T, end: T}>())
        }),
        isDataProvider,
        needsConfig<DatasetDomainSeriesConfig<T>>()
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

export const DatasetDomainSeries = createSeriesType<number>(DOMAIN_SERIES_TYPE);
export const DatasetTimeSeries = createSeriesType<Date>(TIME_SERIES_TYPE);

export type IDatasetDomainSeries = Instance<typeof DatasetDomainSeries>;
export type IDatasetTimeSeries = Instance<typeof DatasetTimeSeries>;
