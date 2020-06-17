import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import debounce from 'lodash/debounce';

import { CancelablePromise, LoadingState } from '@oida/core';
import { hasConfig } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';
import { DatasetVariable, DatasetDimension, DomainRange } from '../dataset-variable';
import { isDataProvider } from '../../datasets-explorer/is-data-provider';
import { hasDimensions } from '../has-dimensions';

export const TRANSECT_SERIES_TYPE = 'transect_series';

export type DatasetTransectSeriesRequest = {
    variable: string;
    geometry: GeoJSON.LineString;
    dimensionValues?: Map<string, string | Date | number>;
};

export type DatasetTransectSeriesConfig = {
    variables: DatasetVariable<number>[];
    maxLineStringLength?: number;
    provider: (request: DatasetTransectSeriesRequest) => CancelablePromise<number[]>;
    dimensions: DatasetDimension<string | number | Date>[];
};

type TransectDimensionType = string | Date | number;

const DatasetTransectSeriesDecl = DatasetViz.addModel(types.compose(
    TRANSECT_SERIES_TYPE,
    types.model({
        variable: types.maybe(types.string)
    }),
    hasDimensions,
    isDataProvider,
    hasConfig<DatasetTransectSeriesConfig>()
).volatile((self) => ({
    data: [] as number[]
})).actions((self) => {

    const areAllDimensionsFilled = (dimensionValues: Map<string, TransectDimensionType>) => {
        return self.config.dimensions.every(dim => dimensionValues.has(dim.id));
    };

    return {
        updateData: flow(function*(params: Partial<DatasetTransectSeriesRequest>) {
            try {
                const { geometry, variable, dimensionValues} = params;
                if (geometry && variable && dimensionValues && areAllDimensionsFilled(dimensionValues)) {
                    self.data = yield self.startDataRequest(self.config.provider({
                        geometry, variable, dimensionValues
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
        afterAttach: () => {

            let seriesUpdateDisposer = autorun(() => {

                const params = {
                    geometry: (self as IDatasetTransectSeries).aoi?.geometry as (GeoJSON.LineString | undefined),
                    variable: self.variable,
                    dimensionValues: new Map(self.dimensionValues)
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
