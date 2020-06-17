import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance } from 'mobx-state-tree';

import { QueryFilter, Geometry, AoiSupportedGeometry, CancelablePromise, LoadingState } from '@oida/core';
import { hasConfig, hasGeometry } from '@oida/state-mst';

import { DatasetVariable, DatasetDimension, DomainRange, isValueDomain } from '../dataset-variable';
import { DatasetViz } from '../dataset-viz';
import { hasDimensions } from '../has-dimensions';

import { isDataProvider } from '../../datasets-explorer/is-data-provider';

import debounce from 'lodash/debounce';

export const DIMENSION_SERIES_TYPE = 'dimension_series';

export type DatasetDimensionSeriesRequest<T = string | Date | number> = {
    dimension: string;
    range?: DomainRange<T>;
    dimensionValues?: Map<string, string | Date | number>;
    variable: string;
    geometry: Geometry;
};

export type DatasetDimensionSeriesValueItem<T = string | Date | number> = {
    x: T;
    y: number;
};

export type DatasetDimensionSeriesStatsItem<T = string | Date | number> = {
    x: T;
    min: number;
    max: number;
    mean: number;
};

export type DatasetDimensionSeriesData<T = string | Date | number> =
    DatasetDimensionSeriesValueItem<T>[] |  DatasetDimensionSeriesStatsItem<T>[];

export const isStatsDimensionSeriesData = <T = string | Date | number>
(seriesData: DatasetDimensionSeriesData<T>) : seriesData is DatasetDimensionSeriesStatsItem<T>[] => {
    return !!seriesData.length && (seriesData as DatasetDimensionSeriesStatsItem<T>[])[0].min !== undefined;
};


export type DatasetDimensionSeriesProvider<T = string | Date | number> =
    (request: DatasetDimensionSeriesRequest<T>) => CancelablePromise<DatasetDimensionSeriesData<T>>;

export type DatasetDimensionSeriesConfig<T = string | Date | number> = {
    provider: DatasetDimensionSeriesProvider<T>;
    supportedGeometries: AoiSupportedGeometry[],
    variables: DatasetVariable<number>[];
    dimensions: DatasetDimension<T>[];
};

type SeriesDimensionType = string | Date | number;

const createSeriesType = (typeName: string) => {
    return DatasetViz.addModel(types.compose(
        typeName,
        types.model(typeName, {
            dimension: types.maybe(types.string),
            variable: types.maybe(types.string),
            range: types.maybe(types.frozen<DomainRange<SeriesDimensionType>>())
        }),
        hasDimensions,
        isDataProvider,
        hasConfig<DatasetDimensionSeriesConfig<SeriesDimensionType>>()
    ).volatile((self) => ({
        data: [] as DatasetDimensionSeriesData<SeriesDimensionType>
    })).actions((self) => {

        const areAllDimensionsFilled = (dimension: string, dimensionValues?: Map<string, SeriesDimensionType>) => {
            return self.config.dimensions.every(dim => dim.id === dimension || dimensionValues?.has(dim.id));
        };

        return {
            updateData: flow(function*(params: Partial<DatasetDimensionSeriesRequest<SeriesDimensionType>>) {
                try {
                    let {range, geometry, variable, dimension, dimensionValues} = params;
                    if (geometry && variable && dimension && areAllDimensionsFilled(dimension, dimensionValues)) {
                        self.data = yield self.startDataRequest(self.config.provider({
                            range, geometry, variable, dimension, dimensionValues
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
            setDimension: (dimension: string | undefined) => {
                self.dimension = dimension;
                if (dimension) {
                    self.setDimensionValue(dimension, undefined);
                    if (dimension === 'time') {
                        const series = self as IDatasetDimensionSeries;
                        series.dataset.config.timeDistribution?.provider.getTimeExtent().then((extent) => {
                            series.setRange(extent ? {
                                min: extent?.start,
                                max: extent.end ? extent.end : extent.start
                            } : undefined);
                        });
                    } else {
                        let dimensionConfig = self.config.dimensions?.find(dim => dim.id === dimension);
                        if (dimensionConfig && dimensionConfig.domain && isValueDomain(dimensionConfig.domain)) {
                            self.range = {
                                min: dimensionConfig.domain.min as number,
                                max: dimensionConfig.domain.max as number
                            };
                        } else {
                            self.range = undefined;
                        }
                    }
                } else {
                    self.range = undefined;
                }
            },
            setVariable: (variable: string | undefined) => {
                self.variable = variable;
            },
            setRange: (range?: DomainRange<SeriesDimensionType>) => {
                self.range = range;
            },
            afterAttach: () => {

                let seriesUpdateDisposer = autorun(() => {

                    let params = {
                        range: self.range,
                        geometry: (self as IDatasetDimensionSeries).aoi?.geometry,
                        variable: self.variable,
                        dimension: self.dimension,
                        dimensionValues: new Map(self.dimensionValues)
                    };
                    debouncedUpdate(params);

                });

                (self as IDatasetDimensionSeries).setDimension(self.config.dimensions[0].id);

                addDisposer(self, () => {
                    seriesUpdateDisposer();
                });
            }
        };
    }));
};

const DatasetDimensionSeriesDecl = createSeriesType(DIMENSION_SERIES_TYPE);

type DatasetDimensionSeriesType = typeof DatasetDimensionSeriesDecl;
export interface DatasetDimensionSeriesInterface extends DatasetDimensionSeriesType {}
export const DatasetDimensionSeries: DatasetDimensionSeriesInterface = DatasetDimensionSeriesDecl;
export interface IDatasetDimensionSeries extends Instance<DatasetDimensionSeriesInterface> {}
