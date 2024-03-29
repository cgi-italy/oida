import { autorun, reaction, computed, makeObservable, observable, action, IObservableMapInitialValues } from 'mobx';
import moment from 'moment';

import { SubscriptionTracker, AoiValue, DateRangeValue, randomColorFactory, QueryFilter } from '@oidajs/core';
import { GroupLayer, MapLayer } from '@oidajs/state-mobx';

import { Dataset, DatasetConfig, DatasetViz } from '../common';
import { DatasetTimeDistributionViz } from '../dataset-time-distrbution';
import { DatasetAnalytics } from '../dataset-analytics';
import { TimeRange } from './time-range';

export type DatasetExplorerItemInitialState = {
    disableToiSync?: boolean;
    aoi?: AoiValue;
    toi?: Date | DateRangeValue;
    additionalFilters?: IObservableMapInitialValues<string, QueryFilter>;
    mapViz?: any;
};

export type DatasetExplorerItemProps = {
    datasetConfig: DatasetConfig;
    explorer: DatasetExplorer;
    initialState?: DatasetExplorerItemInitialState;
};

/**
 * Automatically generated by the {@link DatasetExplorer.addDataset} method. It manages the creation of the {@link Dataset} instance,
 * its main map visualization (when the {@link DatasetConfig} mapView is specified) and
 * {@link DatasetTimeDistributionViz | time distribution} state (when {@link DatasetConfig} timeDistribution is specified).
 * It is automatically binded to the {@link DatasetExplorer} state. All {@link DatasetExplorer.commonFilters} are automatically
 * propagated to the {@link DatasetExplorerItem.dataset}, in order to be available to all the associated
 * {@link DatasetViz | dataset visualizations}. When a time filter is set on the DatasetExplorer, the corresponding dataset
 * time filter is set to the nearest dataset product time, based on the {@link DatasetExplorerItem.timeDistributionViz} configuration.
 * The {@link DatasetExplorerItem.timeDistributionViz} search params are automatically updated based on the state of
 * {@link DatasetExplorer.timeExplorer}
 *
 */
export class DatasetExplorerItem {
    readonly dataset: Dataset;
    readonly mapViz: DatasetViz<string, MapLayer | undefined> | undefined;
    readonly timeDistributionViz: DatasetTimeDistributionViz | undefined;
    readonly explorer: DatasetExplorer;
    @observable.ref toiSyncDisabled: boolean;

    protected pendingNearestTimeRequests_: Promise<any> | undefined;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetExplorerItemProps) {
        this.dataset = new Dataset({
            config: props.datasetConfig,
            additionalFilters: {
                values: props.initialState?.additionalFilters
            },
            aoi: props.initialState?.aoi,
            toi: props.initialState?.toi,
            onToiUpdate: (toi) => {
                if (!this.toiSyncDisabled && toi !== undefined) {
                    this.explorer.setToi(toi);
                }
            }
        });
        this.explorer = props.explorer;

        if (this.explorer.mapExplorer && props.datasetConfig.mapView) {
            this.mapViz = DatasetViz.create<any>({
                dataset: this.dataset,
                vizType: props.datasetConfig.mapView.type,
                config: props.datasetConfig.mapView.config,
                ...props.initialState?.mapViz
            });
        }

        if (this.explorer.timeExplorer && props.datasetConfig.timeDistribution) {
            this.timeDistributionViz = new DatasetTimeDistributionViz({
                dataset: this.dataset,
                parent: this.mapViz,
                config: {
                    provider: props.datasetConfig.timeDistribution.provider
                }
            });
        }

        this.toiSyncDisabled = props.initialState?.disableToiSync || false;

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();
    }

    @action
    setToiSyncEnabled(enabled: boolean) {
        this.cancelPendingTimeRequest_();
        this.toiSyncDisabled = !enabled;
    }

    dispose() {
        this.cancelPendingTimeRequest_();
        if (this.mapViz) {
            this.mapViz.dispose();
        }

        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        //propagate the explorer aoi to the dataset
        const aoiSyncDisposer = autorun(() => {
            this.dataset.setAoi(this.explorer.aoi);
        });

        // propagate the explorer selected time of interest to the dataset (nearest match)
        const toiSyncDisposer = reaction(
            () => {
                return {
                    syncDisabled: this.toiSyncDisabled,
                    toi: this.explorer.toi,
                    // force toi update on time distribution change
                    filtersRevision: this.timeDistributionViz?.distributionRevision
                };
            },
            (data) => {
                if (!data.syncDisabled) {
                    if (data.toi instanceof Date) {
                        this.setDatasetToiFromDate_(data.toi);
                    } else {
                        this.dataset.setToi(data.toi, true);
                    }
                }
            },
            {
                fireImmediately: true
            }
        );

        this.subscriptionTracker_.addSubscription(aoiSyncDisposer);
        this.subscriptionTracker_.addSubscription(toiSyncDisposer);

        const timeExplorer = this.explorer.timeExplorer;
        const timeDistributionViz = this.timeDistributionViz;
        if (timeExplorer && timeDistributionViz) {
            //automatically update the time distribution search params according to the
            //time explorer visible range
            const timeDistributionSearchParamsDisposer = autorun(() => {
                const active = timeExplorer.active;
                const timeRange = timeExplorer.timeRange.value;
                if (active) {
                    timeDistributionViz.setSearchParams({
                        ...timeRange,
                        resolution: timeExplorer.timeRange.resolution
                    });
                }
            });

            this.subscriptionTracker_.addSubscription(timeDistributionSearchParamsDisposer);
        }
    }

    protected setDatasetToiFromDate_(dt: Date) {
        this.cancelPendingTimeRequest_();

        //find the nearest match
        const timeDistributionProvider = this.dataset.config.timeDistribution?.provider;
        if (timeDistributionProvider) {
            this.pendingNearestTimeRequests_ = timeDistributionProvider
                .getNearestItem(dt)
                .then((item) => {
                    if (!this.toiSyncDisabled) {
                        if (!item || !item.start) {
                            this.dataset.setToi(undefined, true);
                        } else {
                            this.dataset.setToi(
                                item.start,
                                this.explorer.items.filter((item) => item.timeDistributionViz !== undefined).length > 1
                            );
                        }
                    }
                })
                .catch((error) => {
                    if (!this.toiSyncDisabled) {
                        this.dataset.setToi(undefined, true);
                    }
                });
        } else {
            this.dataset.setToi(dt, true);
        }
    }

    protected cancelPendingTimeRequest_() {
        if (this.pendingNearestTimeRequests_ && this.pendingNearestTimeRequests_.cancel) {
            this.pendingNearestTimeRequests_.cancel();
            this.pendingNearestTimeRequests_ = undefined;
        }
    }
}

/**
 * A class to manage the datasets time exploration state. It is part of the {@link DatasetExplorer} state.
 * and all datasets added to the explorer will provide their products {@link DatasetTimeDistributionViz | time distribution}
 * in the time range set here.
 */
export class DatasetTimeExplorer {
    @observable.ref active: boolean;
    /** The explorer visible time range */
    readonly timeRange: TimeRange;

    constructor() {
        this.active = false;
        this.timeRange = new TimeRange({
            start: moment().subtract(1, 'month').toDate(),
            end: moment().toDate()
        });

        makeObservable(this);
    }

    @action
    setActive(active: boolean) {
        this.active = active;
    }
}

/**
 * A class to manage the datasets map visualizations. It is part of the {@link DatasetExplorer} state
 */
export class DatasetMapExplorer {
    readonly mapLayer: GroupLayer;
    @observable.ref nearestMatch: boolean;

    constructor() {
        this.mapLayer = new GroupLayer({
            id: 'explorerDatasetViews'
        });
        this.nearestMatch = true;
    }

    get active() {
        return this.mapLayer.visible;
    }

    @action
    setActive(active: boolean) {
        this.mapLayer.visible.setValue(active);
    }

    @action
    setNearestMatch(enabled: boolean) {
        this.nearestMatch = enabled;
    }
}

export type DatasetsExplorerConfig = {
    timeExplorer?: {
        disabled?: boolean;
        rangeModeDisabled?: boolean;
    };
    disableProductSearch?: boolean;
    disableMapView?: boolean;
};

export type DatasetsExplorerProps = {
    /** A layer that will contain all datasets map visualizations */
    mapLayer: GroupLayer;
    config?: DatasetsExplorerConfig;
};

const randomColor = randomColorFactory();

/**
 * Main class to manage a combined exploration of a set of EO Datasets.
 */
export class DatasetExplorer {
    readonly config: DatasetsExplorerConfig;
    /**
     * The layer group containing all datasets map visualizations (i.e. layers and analyses).
     */
    readonly mapLayer: GroupLayer;

    @observable.ref aoi: AoiValue | undefined;
    @observable.ref toi: Date | DateRangeValue | undefined;
    /** The dataset time explorer state  */
    readonly timeExplorer: DatasetTimeExplorer | undefined;
    /** The map explorer. It contains all dataset map visualizations */
    readonly mapExplorer: DatasetMapExplorer | undefined;
    /** The dataset analyses */
    readonly analytics: DatasetAnalytics;
    /** The datasets array */
    readonly items = observable.array<DatasetExplorerItem>([], { deep: false });

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetsExplorerProps) {
        this.config = props.config || {};
        this.mapLayer = props.mapLayer;

        this.aoi = undefined;
        this.toi = undefined;

        if (!props.config?.timeExplorer?.disabled) {
            this.timeExplorer = new DatasetTimeExplorer();
        }
        if (!props.config?.disableMapView) {
            this.mapExplorer = new DatasetMapExplorer();
            this.mapLayer.children.add(this.mapExplorer.mapLayer);
        }

        this.analytics = new DatasetAnalytics({
            active: true
        });
        this.mapLayer.children.add(this.analytics.geometryLayer);
        this.mapLayer.children.add(this.analytics.processingsLayer);

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    @action
    setAoi(aoi: AoiValue | undefined) {
        this.aoi = aoi;
    }

    @action
    setToi(toi: Date | DateRangeValue | undefined) {
        //avoid update on deep equality
        if (toi instanceof Date) {
            if (this.toi instanceof Date && toi.getTime() === this.toi.getTime()) {
                return;
            }
        } else if (toi) {
            if (this.toi && !(this.toi instanceof Date)) {
                if (this.toi.start.getTime() === toi.start.getTime() && this.toi.end.getTime() === toi.end.getTime()) {
                    return;
                }
            }
        }
        this.toi = toi;
    }

    @computed
    get shouldEnableTimeExplorer(): boolean {
        return this.timeExplorer !== undefined && this.items.some((dataset) => !!dataset.timeDistributionViz);
    }

    @action
    addDataset(datasetConfig: DatasetConfig, initialState?: DatasetExplorerItemInitialState) {
        if (!datasetConfig.color) {
            datasetConfig.color = randomColor();
        }
        const item = new DatasetExplorerItem({
            datasetConfig: datasetConfig,
            explorer: this,
            initialState: initialState
        });

        this.items.unshift(item);
        if (this.mapExplorer && item.mapViz?.mapLayer) {
            this.mapExplorer.mapLayer.children.add(item.mapViz.mapLayer);
        }
        return item;
    }

    @action
    removeDataset(datasetId: string) {
        const item = this.items.find((item) => item.dataset.id === datasetId);
        if (item) {
            this.destroyDataset_(item);
            this.items.remove(item);
        }
    }

    @action
    moveDataset(idx, newIdx) {
        const item = this.items[idx];
        if (item) {
            this.items.splice(idx, 1);
            this.items.splice(newIdx, 0, item);

            if (this.mapExplorer && item.mapViz?.mapLayer) {
                // TODO: the map layer new index is not valid if one of the items doesn't have a map visualization
                this.mapExplorer.mapLayer.children.move(item.mapViz.mapLayer, this.items.length - newIdx - 1);
            }
        }
    }

    @action
    clearDatasets() {
        this.items.forEach((item) => this.destroyDataset_(item));
        this.items.clear();
    }

    getDataset(datasetId: string) {
        return this.items.find((item) => item.dataset.id === datasetId);
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
        this.clearDatasets();

        if (this.mapExplorer) {
            this.mapLayer.children.remove(this.mapExplorer.mapLayer);
        }
    }

    protected afterInit_() {
        const timeExplorer = this.timeExplorer;

        if (timeExplorer) {
            const autoTimeZoomDisposer = autorun(() => {
                const toi = this.toi;
                if (!toi) {
                    return;
                }
                if (toi instanceof Date) {
                    timeExplorer.timeRange.centerDate(toi, {
                        notIfVisible: true,
                        animate: true
                    });
                } else if (toi) {
                    timeExplorer.timeRange.centerRange(toi.start, toi.end, {
                        notIfVisible: true,
                        animate: true,
                        margin: 0.2
                    });
                }
            });

            this.subscriptionTracker_.addSubscription(autoTimeZoomDisposer);
        }
    }

    @action
    protected destroyDataset_(dataset: DatasetExplorerItem) {
        dataset.dispose();

        if (this.mapExplorer && dataset.mapViz?.mapLayer) {
            this.mapExplorer.mapLayer.children.remove(dataset.mapViz.mapLayer);
        }
    }
}
