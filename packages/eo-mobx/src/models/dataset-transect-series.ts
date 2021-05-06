import { autorun, observable, makeObservable, action, runInAction, computed, reaction } from 'mobx';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import along from '@turf/along';
import chroma from 'chroma-js';

import { Geometry, IFeatureStyle, IndexableGeometry, LoadingState, SubscriptionTracker } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, TimeSearchDirection, NumericVariable } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { analysisPlaceHolderIcon } from './dataset-analyses';


export const TRANSECT_SERIES_TYPE = 'transect_series';

type TransectDimensionType = string | Date | number;

export type DatasetTransectSeriesRequest = {
    variable: string;
    geometry: GeoJSON.LineString;
    numSamples?: number;
    dimensionValues?: Map<string, TransectDimensionType>;
};

export type DatasetTransectSeriesProvider = (request: DatasetTransectSeriesRequest) => Promise<Array<{x: number, y: number}>>;

export type DatasetTransectSeriesConfig = {
    variables: NumericVariable[];
    maxLineStringLength?: number;
    supportsNumSamples?: boolean;
    maxNumSamples?: number;
    provider: DatasetTransectSeriesProvider;
    dimensions: DatasetDimension<DataDomain<TransectDimensionType>>[];
};


export type TransectSeriesItem = {
    value: number,
    distance: number,
    coordinates: GeoJSON.Position
};

export type DatasetTransectSeriesProps = {
    seriesVariable?: string;
    numSamples?: number;
    autoUpdate?: boolean;
} & DatasetAnalysisProps<typeof TRANSECT_SERIES_TYPE, DatasetTransectSeriesConfig> & DatasetDimensionsProps;

export class DatasetTransectSeries extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetTransectSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref data: TransectSeriesItem[];
    @observable.ref numSamples: number | undefined;
    @observable.ref autoUpdate: boolean;
    @observable.ref highlightedPosition: number | undefined;

    protected dataFetcher_: AsyncDataFetcher<TransectSeriesItem[] | undefined, DatasetTransectSeriesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetTransectSeriesProps, 'vizType'>) {
        super({
            vizType: TRANSECT_SERIES_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.seriesVariable = props.seriesVariable;
        this.numSamples = props.numSamples;
        if (props.config.supportsNumSamples && !this.numSamples) {
            this.numSamples = props.config.maxNumSamples ? Math.min(props.config.maxNumSamples, 20) : 20;
        }
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.highlightedPosition = undefined;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params).then((data) => {

                    const line = {
                        type: 'Feature',
                        geometry: params.geometry,
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
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });
        this.subscriptionTracker_ = new SubscriptionTracker();
        this.needsUpdate_ = true;

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }


    @action
    setVariable(variable: string | undefined) {
        this.seriesVariable = variable;
        this.needsUpdate_ = true;
    }

    @action
    setNumSamples(numSamples: number | undefined) {
        this.numSamples = numSamples;
        this.needsUpdate_ = true;
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
        if (this.data.length) {
            geometries.push({
                type: 'MultiPoint',
                id: 'samples',
                coordinates: this.data.map((item) => {
                    return item.coordinates;
                })
            });
        }
        return {
            type: 'GeometryCollectionEx',
            geometries: geometries
        };
    }

    get style() {
        let color = chroma(this.color);
        if (this.selected.value) {
            color = color.alpha(0.3);
        } else {
            color = color.alpha(0.1);
        }

        let zIndex = 0;
        if (this.selected.value) {
            zIndex = 1;
        }
        if (this.hovered.value) {
            zIndex = 2;
        }

        const styles: Record<string, IFeatureStyle> = {
            highlightedCoord: {
                point: {
                    visible: this.visible.value && !this.needsUpdate_,
                    url: analysisPlaceHolderIcon,
                    scale: 0.5,
                    color: color.alpha(1).gl(),
                    zIndex: zIndex
                }
            },
            aoi: {
                line: {
                    visible: this.visible.value,
                    color: color.alpha(1).gl(),
                    width: this.hovered.value ? 3 : 2,
                    zIndex: zIndex
                }
            },
            samples: {
                point: {
                    visible: this.visible.value && !this.needsUpdate_,
                    radius: this.hovered.value ? 4 : 2,
                    fillColor: color.alpha(0.9).gl(),
                    strokeColor: color.alpha(1).gl(),
                    zIndex: zIndex
                }
            }
        };

        return styles;
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

    @action
    setAutoUpdate(autoUpdate: boolean) {
        this.autoUpdate = autoUpdate;
        if (autoUpdate) {
            this.dataFetcher_.setDebounceInterval(1000);
        } else {
            this.dataFetcher_.setDebounceInterval(0);
        }
    }

    @computed
    get canRunQuery() {
        return !!this.aoi?.geometry.value
        && !!this.seriesVariable
        && this.config.dimensions.every((dim) => {
            return this.dimensions.values.has(dim.id) && this.dimensions.values.get(dim.id);
        });
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_.fetchData({
                    geometry: this.aoi?.geometry.value as GeoJSON.LineString,
                    variable: this.seriesVariable!,
                    dimensionValues: new Map(this.dimensions.values),
                    numSamples: this.numSamples
                }).then((data) => {
                    this.setData_(data || []);
                    this.needsUpdate_ = false;
                }).catch(() => {
                    this.setData_([]);
                });
            }
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_([]);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            seriesVariable: this.seriesVariable,
            dimensionValues: this.dimensions.values,
            autoUpdate: this.autoUpdate,
            numSamples: this.numSamples
        }) as DatasetTransectSeries;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    @action
    protected setData_(data: TransectSeriesItem[]) {
        this.data = data;
    }

    protected afterInit_() {

        if (!this.seriesVariable) {
            this.setVariable(this.config.variables[0].id);
        }
        if (!this.dimensions.values.has('time')) {
            //if the time dimension have not been passed in config initialize the time
            // dimension value to the current dataset selected time
            const timeDimension = this.config.dimensions.find((dimension) => dimension.id === 'time');
            if (timeDimension) {
                const datasetTime = this.dataset.selectedTime;
                if (datasetTime) {
                    if (datasetTime instanceof Date) {
                        this.dimensions.setValue('time', datasetTime);
                    } else {
                        //a time range is currently selected. try to find the time nearest to the range end time
                        const timeProvider = this.dataset.config.timeDistribution?.provider;
                        if (timeProvider) {
                            timeProvider.getNearestItem(datasetTime.end, TimeSearchDirection.Backward).then((dt) => {
                                if (dt) {
                                    this.dimensions.setValue('time', dt.start);
                                }
                            });
                        } else {
                            this.dimensions.setValue('time', datasetTime.end);
                        }
                    }
                }
            }
        }

        const seriesUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        const highlightedCoordDismissDisposer = autorun(() => {
            if (!this.hovered.value) {
                this.setHighlightedPosition(undefined);
            }
        });

        const updateTrackerDisposer = reaction(() => {
            return {
                aoi: this.aoi?.geometry.value,
                dimensions: new Map(this.dimensions.values)
            };
        }, () => {
            this.needsUpdate_ = true;
        });

        this.subscriptionTracker_.addSubscription(seriesUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(highlightedCoordDismissDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}

