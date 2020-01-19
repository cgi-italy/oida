import { autorun } from 'mobx';
import { types, addDisposer, flow, Instance, SnapshotOut } from 'mobx-state-tree';

import { QueryFilter, Geometry, GeometryTypes, CancelablePromise, LoadingState } from '@oida/core';
import { needsConfig } from '@oida/state-mst';

import { ColorMap, ColorMapConfig } from '../map-viz/raster-map-viz';
import { DatasetAnalysis } from './dataset-analysis';
import { DatasetVariable } from './dataset-domain-series';
import { isDataProvider } from '../../datasets-explorer/is-data-provider';

import debounce from 'lodash/debounce';

export const DOMAIN_RASTER_SEQUENCE_TYPE = 'domain_raster_sequence';
export const TIME_RASTER_SEQUENCE_TYPE = 'time_raster_sequence';

export type DatasetRasterSequenceRequest<T> = {
    range: {
        start: T;
        end: T;
    },
    variable: string;
    geometry: Geometry;
    filters: QueryFilter[];
};

export type DatasetRasterSequenceItem<T> = {
    x: T;
    data: any;
};

export type DatasetRasterSequenceProvider<T> =
(request: DatasetRasterSequenceRequest<T>) => CancelablePromise<DatasetRasterSequenceItem<T>[]>;


export type DatasetRasterSeriesConfig<T = number> = {
    domain: DatasetVariable<T>;
    provider: DatasetRasterSequenceProvider<T>;
    processor: (data: any, sequenceAnalysis) => string;
    imageGenerator: (data: any, colorMap: SnapshotOut<typeof ColorMap>, canvas: HTMLCanvasElement) => void;
    supportedGeometries: GeometryTypes[];
    colorMap: ColorMapConfig;
};

const createRasterSequenceType = <T>(typeName: string) => {
    return DatasetAnalysis.addModel(types.compose(
        typeName,
        types.model(typeName, {
            range: types.maybe(types.frozen<{start: T, end: T}>()),
            colorMap: types.maybe(ColorMap)
        }),
        isDataProvider,
        needsConfig<DatasetRasterSeriesConfig<T>>()
    ).volatile((self) => ({
        data: [] as DatasetRasterSequenceItem<T>[]
    })).actions((self) => {
        return {
            updateData: flow(function*(params: Partial<DatasetRasterSequenceRequest<T>>) {
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
            setRange: (range) => {
                self.range = range;
            },
            setColorMap: (colorMap) => {
                self.colorMap = colorMap;
            },
            afterAttach: () => {

                let seriesUpdateDisposer = autorun(() => {

                    let params = {
                        range: self.range,
                        //@ts-ignore
                        geometry: self.geometry,
                        variable: self.colorMap ? self.colorMap.variable : undefined,
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
    })
    .views((self) => ({
        get thumbs() {
            return self.data.map((item) => ({
                x: item.x,
                src: self.config!.processor(item.data, self),
            }));
        }
    })));
};

export const DatasetDomainRasterSequence = createRasterSequenceType<number>(DOMAIN_RASTER_SEQUENCE_TYPE);
export const DatasetTimeRasterSequence = createRasterSequenceType<Date>(TIME_RASTER_SEQUENCE_TYPE);

export type IDatasetDomainRasterSequence = Instance<typeof DatasetDomainRasterSequence>;
export type IDatasetTimeRasterSequence = Instance<typeof DatasetTimeRasterSequence>;
