import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import debounce from 'lodash/debounce';

import { QueryFilter, CancelablePromise, LoadingState } from '@oida/core';
import { hasConfig, hasGeometry } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { DatasetVariable, DatasetDimension, DomainRange } from '../dataset-variable';
import { isDataProvider } from '../../datasets-explorer/is-data-provider';

export const TRANSECT_SERIES_TYPE = 'transect_series';

export type DatasetTransectSeriesRequest = {
    date: Date;
    variable: string;
    geometry: GeoJSON.LineString;
    filters: QueryFilter[];
};

export type DatasetTransectSeriesConfig = {
    timeDomain?: DomainRange<Date>;
    variables: DatasetVariable<number>[];
    maxLineStringLength?: number;
    provider: (request: DatasetTransectSeriesRequest) => CancelablePromise<number[]>
};

const DatasetTransectSeriesDecl = DatasetViz.addModel(types.compose(
    TRANSECT_SERIES_TYPE,
    types.model({
        variable: types.maybe(types.string),
        date: types.maybe(types.Date)
    }),
    hasGeometry,
    isDataProvider,
    hasConfig<DatasetTransectSeriesConfig>()
).volatile((self) => ({
    data: [] as number[]
})).actions((self) => {
    return {
        updateData: flow(function*(params: Partial<DatasetTransectSeriesRequest>) {
            try {
                const {date, geometry, variable, filters} = params;
                if (date && geometry && variable && filters) {
                    self.data = yield self.startDataRequest(self.config.provider({
                        date, geometry, variable, filters
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
}).actions((self) => {

    const debouncedUpdate = debounce(self.updateData, 1000);

    return {
        setVariable: (variable: string | undefined) => {
            self.variable = variable;
        },
        setDate: (date?: Date) => {
            self.date = date;
        },
        afterAttach: () => {

            let seriesUpdateDisposer = autorun(() => {

                const params = {
                    date: self.date,
                    //@ts-ignore
                    geometry: self.geometry as (GeoJSON.LineString | undefined),
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

type DatasetTransectSeriesType = typeof DatasetTransectSeriesDecl;
export interface DatasetTransectSeriesInterface extends DatasetTransectSeriesType {}
export const DatasetTransectSeries: DatasetTransectSeriesInterface = DatasetTransectSeriesDecl;
export interface IDatasetTransectSeries extends Instance<DatasetTransectSeriesInterface> {}
