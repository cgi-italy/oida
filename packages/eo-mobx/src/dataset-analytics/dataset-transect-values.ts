import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import along from '@turf/along';
import chroma from 'chroma-js';

import { Geometry, IFeatureStyle, IndexableGeometry, LoadingState, QueryFilter, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import { DatasetDimension, NumericVariable, DimensionDomainType, CategoricalDimensionValueType } from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';
import { analysisPlaceHolderIcon } from './analysis-placeholder-icon';

export const TRANSECT_VALUES_PROCESSING = 'transect_values_processing';

export type DatasetTransectValuesRequest = {
    variable: string;
    geometry: GeoJSON.LineString;
    numSamples?: number;
    dimensionValues?: Map<string, CategoricalDimensionValueType>;
    additionalDatasetFilters?: Map<string, QueryFilter>;
};

export type DatasetTransectValuesProvider = (request: DatasetTransectValuesRequest) => Promise<Array<{ x: number; y: number }>>;

export type DatasetTransectValuesConfig = {
    variables: NumericVariable[];
    maxLineStringLength?: number;
    supportsNumSamples?: boolean;
    maxNumSamples?: number;
    provider: DatasetTransectValuesProvider;
    dimensions: DatasetDimension<DimensionDomainType>[];
};

export type TransectSeriesItem = {
    value: number;
    distance: number;
    coordinates: GeoJSON.Position;
};

export type DatasetTransectValuesProps = Omit<
    DatasetProcessingProps<typeof TRANSECT_VALUES_PROCESSING, DatasetTransectValuesConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    seriesVariable?: string;
    numSamples?: number;
    autoUpdate?: boolean;
};

export class DatasetTransectValues extends DatasetProcessing<typeof TRANSECT_VALUES_PROCESSING, undefined> {
    readonly config: DatasetTransectValuesConfig;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref data: TransectSeriesItem[];
    @observable.ref numSamples: number | undefined;
    @observable.ref autoUpdate: boolean;
    @observable.ref highlightedPosition: number | undefined;

    protected dataFetcher_: AsyncDataFetcher<TransectSeriesItem[] | undefined, DatasetTransectValuesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetTransectValuesProps, 'vizType'>) {
        super({
            vizType: TRANSECT_VALUES_PROCESSING,
            dimensionValues: props.dimensionValues || props.parent?.dimensions.values,
            currentVariable: () => this.seriesVariable,
            dimensions: props.config.dimensions,
            initDimensions: true,
            ...props
        });

        this.config = props.config;

        this.seriesVariable = props.seriesVariable;
        if (!this.seriesVariable) {
            const parentVariable = this.parent?.dimensions.variable;
            if (parentVariable && this.config.variables.find((variable) => variable.id === parentVariable)) {
                this.seriesVariable = parentVariable;
            }
        }
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
            const geometry: GeoJSON.LineString = {
                type: 'LineString',
                coordinates: this.data.map((item) => item.coordinates)
            };

            const nearest = nearestPointOnLine(geometry, coordinate);
            let nearestIdx = nearest.properties.index;
            if (nearestIdx !== undefined && nearestIdx < this.data.length - 1 && nearest.properties.location !== undefined) {
                const distToPrev = Math.abs(this.data[nearestIdx].distance - nearest.properties.location);
                const distToNext = Math.abs(this.data[nearestIdx + 1].distance - nearest.properties.location);
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
        return (
            !!this.aoi?.geometry.value &&
            !!this.seriesVariable &&
            this.config.dimensions.every((dim) => {
                return this.dimensions.values.has(dim.id) && this.dimensions.values.get(dim.id);
            })
        );
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_
                    .fetchData({
                        geometry: this.aoi?.geometry.value as GeoJSON.LineString,
                        variable: this.seriesVariable!,
                        dimensionValues: new Map(this.dimensions.values),
                        numSamples: this.numSamples,
                        additionalDatasetFilters: new Map(this.dataset.additionalFilters.items)
                    })
                    .then((data) => {
                        this.setData_(data || []);
                        this.needsUpdate_ = false;
                    })
                    .catch(() => {
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
            autoUpdate: this.autoUpdate,
            numSamples: this.numSamples
        });
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

        const updateTrackerDisposer = reaction(
            () => {
                return {
                    aoi: this.aoi?.geometry.value,
                    dimensions: new Map(this.dimensions.values)
                };
            },
            () => {
                this.needsUpdate_ = true;
            }
        );

        this.subscriptionTracker_.addSubscription(seriesUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(highlightedCoordDismissDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}
