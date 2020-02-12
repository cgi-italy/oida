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

export type DatasetRasterSequenceThumbGenerator =
(data: any, colorMap: SnapshotOut<typeof ColorMap>, canvas: HTMLCanvasElement) => void;

export type DatasetRasterSequenceConfig<T = number> = {
    domain: DatasetVariable<T>;
    provider: DatasetRasterSequenceProvider<T>;
    imageGenerator: DatasetRasterSequenceThumbGenerator;
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
        needsConfig<DatasetRasterSequenceConfig<T>>()
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
    }));
};

const DatasetDomainRasterSequenceDecl = createRasterSequenceType<number>(DOMAIN_RASTER_SEQUENCE_TYPE);

type DatasetDomainRasterSequenceType = typeof DatasetDomainRasterSequenceDecl;
export interface DatasetDomainRasterSequenceInterface extends DatasetDomainRasterSequenceType {}
export const DatasetDomainRasterSequence: DatasetDomainRasterSequenceInterface = DatasetDomainRasterSequenceDecl;
export interface IDatasetDomainRasterSequence extends Instance<DatasetDomainRasterSequenceInterface> {}

const DatasetTimeRasterSequenceDecl = createRasterSequenceType<Date>(TIME_RASTER_SEQUENCE_TYPE);

type DatasetTimeRasterSequenceType = typeof DatasetTimeRasterSequenceDecl;
export interface DatasetTimeRasterSequenceInterface extends DatasetTimeRasterSequenceType {}
export const DatasetTimeRasterSequence: DatasetTimeRasterSequenceInterface = DatasetTimeRasterSequenceDecl;
export interface IDatasetTimeRasterSequence extends Instance<DatasetTimeRasterSequenceInterface> {}