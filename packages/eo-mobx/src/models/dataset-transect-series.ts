import { autorun, observable, makeObservable, action, runInAction, computed } from 'mobx';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import along from '@turf/along';

import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetVariable, DatasetDimension, DataDomain } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { DatasetViz } from './dataset-viz';
import { Geometry, IndexableGeometry } from '@oida/core';


export const TRANSECT_SERIES_TYPE = 'transect_series';

type TransectDimensionType = string | Date | number;

export type DatasetTransectSeriesRequest = {
    variable: string;
    geometry: GeoJSON.LineString;
    dimensionValues?: Map<string, TransectDimensionType>;
};

export type DatasetTransectSeriesConfig = {
    variables: DatasetVariable<DataDomain<number>>[];
    maxLineStringLength?: number;
    provider: (request: DatasetTransectSeriesRequest) => Promise<Array<{x: number, y: number}>>;
    dimensions: DatasetDimension<DataDomain<string | number | Date>>[];
};


export type TransectSeriesItem = {
    value: number,
    distance: number,
    coordinates: GeoJSON.Position
};

export type DatasetTransectSeriesProps = {
    config: DatasetTransectSeriesConfig;
    seriesVariable?: string;
} & Omit<DatasetAnalysisProps, 'vizType'> & DatasetDimensionsProps;

export class DatasetTransectSeries extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetTransectSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref data: TransectSeriesItem[];
    @observable.ref highlightedPosition: number | undefined;

    protected dataFetcher_: AsyncDataFetcher<TransectSeriesItem[] | undefined>;

    constructor(props: DatasetTransectSeriesProps) {
        super({
            vizType: TRANSECT_SERIES_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.seriesVariable = props.seriesVariable;
        this.data = [];
        this.highlightedPosition = undefined;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: () => {
                if (this.canRunQuery_()) {

                    const lineString = this.aoi!.geometry.value as GeoJSON.LineString;

                    return this.config.provider({
                        geometry: lineString,
                        variable: this.seriesVariable!,
                        dimensionValues: this.dimensions.values
                    }).then((data) => {

                        const line = {
                            type: 'Feature',
                            geometry: lineString,
                            properties: {}
                        } as GeoJSON.Feature<GeoJSON.LineString>;

                        return data.map((item) => {
                            const coordinates = along(line, item.x);
                            return {
                                value: item.y,
                                distance: item.x,
                                coordinates: coordinates.geometry.coordinates
                            };
                        });
                    });
                } else {
                    return Promise.resolve(undefined);
                }
            },
            debounceInterval: 1000
        });

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }


    @action
    setVariable(variable: string | undefined) {
        this.seriesVariable = variable;
    }

    @action
    setHighlightedPosition(position: number | undefined) {
        if (position !== undefined && position < this.data.length) {
            this.highlightedPosition = position;
        } else {
            this.highlightedPosition = undefined;
        }
    }

    get geometry(): Geometry | undefined {
        const geometries: IndexableGeometry[] = [];

        if (this.highlightedPosition !== undefined) {
            geometries.push({
                type: 'Point',
                id: 'highlightedCoord',
                coordinates: this.data[this.highlightedPosition].coordinates
            });
        }
        if (this.aoi) {
            geometries.push({
                id: 'aoi',
                ...this.aoi.geometry.value
            });
        }
        return {
            type: 'GeometryCollectionEx',
            geometries: geometries
        };
    }

    onGeometryHover(coordinate: GeoJSON.Position) {
        if (this.data.length) {
            const geometry = {
                type: 'LineString',
                coordinates: this.data.map((item) => item.coordinates)
            };

            let nearest = nearestPointOnLine(geometry, coordinate);
            let nearestIdx = nearest.properties.index;
            if (nearestIdx < this.data.length - 1) {
                let distToPrev = Math.abs(this.data[nearestIdx].distance - nearest.properties.location);
                let distToNext = Math.abs(this.data[nearestIdx + 1].distance - nearest.properties.location);
                if (distToNext < distToPrev) {
                    nearestIdx = nearestIdx + 1;
                }
            }
            this.setHighlightedPosition(nearestIdx);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            seriesVariable: this.seriesVariable,
            dimensionValues: this.dimensions.values
        }) as DatasetTransectSeries;
    }

    protected afterInit_() {
        const seriesUpdaterDisposer = autorun(() => {

            if (this.canRunQuery_()) {

                this.dataFetcher_.fetchData().then(data => {
                    runInAction(() => {
                        this.data = data || [];
                    });
                }).catch(() => {
                    runInAction(() => {
                        this.data = [];
                    });
                });
            }
        });
    }
    protected canRunQuery_ = () => {

        return this.aoi?.geometry.value
            && this.seriesVariable
            && this.config.dimensions.every((dim) => {
                return this.dimensions.values.has(dim.id) && this.dimensions.values.get(dim.id);
            });
    }

    protected initMapLayer_() {
        return undefined;
    }
}

DatasetViz.register(TRANSECT_SERIES_TYPE, DatasetTransectSeries);
