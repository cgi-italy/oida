import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance, SnapshotOut } from 'mobx-state-tree';

import { Geometry, AoiSupportedGeometry, LoadingState } from '@oida/core';
import { hasConfig, hasAsyncData } from '@oida/state-mst';

import { ColorMap, ColorMapConfig } from '../map-viz/color-map';
import { DatasetViz } from '../dataset-viz';
import { DatasetDimension, DataDomain, DomainRange, isValueDomain } from '../dataset-variable';
import { hasDimensions } from '../has-dimensions';

export const DIMENSION_RASTER_SEQUENCE_TYPE = 'dimension_raster_sequence';

export type DatasetRasterSequenceRequest<T = string | Date | number> = {
    dimension: string;
    range?: DomainRange<T>;
    variable: string;
    dimensionValues?: Map<string, string | Date | number>;
    geometry: Geometry;
};

export type DatasetRasterSequenceItem<T = string | Date | number> = {
    x: T;
    data: any;
};

export type DatasetRasterSequenceProvider<T = string | Date | number> =
(request: DatasetRasterSequenceRequest<T>) => Promise<DatasetRasterSequenceItem<T>[]>;

export type DatasetRasterSequenceThumbGenerator =
(data: any, colorMap: SnapshotOut<typeof ColorMap>, canvas: HTMLCanvasElement) => void;

export type DatasetRasterSequenceConfig<T = string | Date | number> = {
    domain: DatasetDimension<DataDomain<T>>;
    provider: DatasetRasterSequenceProvider<T>;
    imageGenerator: DatasetRasterSequenceThumbGenerator;
    supportedGeometries: AoiSupportedGeometry[];
    colorMap: ColorMapConfig;
    dimensions: DatasetDimension<DataDomain<T>>[];
};

type SequenceDimensionType = string | Date | number;

const createRasterSequenceType = (typeName: string) => {
    return DatasetViz.addModel(types.compose(
        typeName,
        types.model(typeName, {
            dimension: types.maybe(types.string),
            range: types.maybe(types.frozen<DomainRange<SequenceDimensionType>>()),
            colorMap: types.maybe(ColorMap)
        }),
        hasAsyncData,
        hasDimensions,
        hasConfig<DatasetRasterSequenceConfig<SequenceDimensionType>>()
    ).volatile((self) => ({
        data: [] as DatasetRasterSequenceItem<SequenceDimensionType>[]
    })).actions((self) => {

        const areAllDimensionsFilled = (dimension: string, dimensionValues?: Map<string, SequenceDimensionType>) => {
            return self.config.dimensions.every(dim => dim.id === dimension || dimensionValues?.has(dim.id));
        };

        return {
            updateData: flow(function*(params: Partial<DatasetRasterSequenceRequest<SequenceDimensionType>>) {
                try {
                    const {range, geometry, variable, dimension, dimensionValues} = params;
                    if (geometry && variable && dimension && areAllDimensionsFilled(dimension, dimensionValues)) {
                        self.data = yield self.retrieveData(() => self.config.provider({
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

        return {
            setDimension: (dimension: string | undefined) => {
                self.dimension = dimension;
                if (dimension) {
                    self.setDimensionValue(dimension, undefined);
                    if (dimension === 'time') {
                        const series = self as IDatasetDimensionRasterSequence;
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
            setRange: (range?: DomainRange<SequenceDimensionType>) => {
                self.range = range;
            },
            setColorMap: (colorMap) => {
                self.colorMap = colorMap;
            },
            afterAttach: () => {

                self.setDebounceInterval(1000);

                let seriesUpdateDisposer = autorun(() => {

                    let params = {
                        range: self.range,
                        geometry: (self as IDatasetDimensionRasterSequence).aoi?.geometry,
                        variable: self.colorMap ? self.colorMap.variable : undefined,
                        dimension: self.dimension,
                        dimensionValues: new Map(self.dimensionValues)
                    };

                    self.updateData(params);

                });

                if (!self.colorMap) {
                    (self as IDatasetDimensionRasterSequence).setColorMap(self.config.colorMap.default);
                }
                if (!self.dimension) {
                    (self as IDatasetDimensionRasterSequence).setDimension(self.config.dimensions[0].id);
                }

                addDisposer(self, () => {
                    seriesUpdateDisposer();
                });
            }
        };
    }));
};

const DatasetDimensionRasterSequenceDecl = createRasterSequenceType(DIMENSION_RASTER_SEQUENCE_TYPE);

type DatasetDimensionRasterSequenceType = typeof DatasetDimensionRasterSequenceDecl;
export interface DatasetDimensionRasterSequenceInterface extends DatasetDimensionRasterSequenceType {}
export const DatasetDimensionRasterSequence: DatasetDimensionRasterSequenceInterface = DatasetDimensionRasterSequenceDecl;
export interface IDatasetDimensionRasterSequence extends Instance<DatasetDimensionRasterSequenceInterface> {}
