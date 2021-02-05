import { autorun, computed, makeObservable, observable, action, observe } from 'mobx';
import moment from 'moment';

import { SubscriptionTracker, AoiValue, DateRangeValue, QueryFilter, DATE_FIELD_ID, DATE_RANGE_FIELD_ID, randomColorFactory } from '@oida/core';
import { GroupLayer, MapLayer, DataFilters } from '@oida/state-mobx';

import { Dataset, DATASET_AOI_FILTER_KEY, DATASET_TIME_RANGE_FILTER_KEY, DATASET_SELECTED_TIME_FILTER_KEY } from './dataset';
import { DatasetConfig } from '../types/dataset-config';
import { DatasetViz } from './dataset-viz';
import { DatasetTimeDistributionViz } from './dataset-time-distribution-viz';
import { TimeRange } from './time-range';
import { TimeSearchDirection } from '../types/dataset-time-distribution-provider';
import { DatasetAnalyses } from './dataset-analyses';


export type DatasetExplorerItemProps = {
    datasetConfig: DatasetConfig;
    explorer: DatasetExplorer;
};

export class DatasetExplorerItem {
    readonly dataset: Dataset;
    readonly mapViz: DatasetViz<MapLayer | undefined> | undefined;
    readonly timeDistributionViz: DatasetTimeDistributionViz | undefined;
    readonly explorer: DatasetExplorer;

    protected pendingNearestTimeRequests_: Promise<any> | undefined;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetExplorerItemProps) {
        this.dataset = new Dataset({
            config: props.datasetConfig,
            onSelectedDateUpdate: ((dt: Date) => {
                // sync the dataset selected date with the global explorer selected date
                props.explorer.setSelectedDate(dt);
            })
        });
        this.explorer = props.explorer;

        if (this.explorer.vizExplorer && props.datasetConfig.mapView) {
            this.mapViz = DatasetViz.create({
                dataset: this.dataset,
                vizType: props.datasetConfig.mapView.type,
                ...props.datasetConfig.mapView.props
            });
        }

        if (this.explorer.timeExplorer && props.datasetConfig.timeDistribution) {
            this.timeDistributionViz = new DatasetTimeDistributionViz({
                dataset: this.dataset,
                config: {
                    provider: props.datasetConfig.timeDistribution.provider
                }
            });
        }

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();
    }

    dispose() {
        if (this.pendingNearestTimeRequests_ && this.pendingNearestTimeRequests_.cancel) {
            this.pendingNearestTimeRequests_.cancel();
            this.pendingNearestTimeRequests_ = undefined;
        }
        if (this.mapViz) {
            this.mapViz.dispose();
        }

        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        const filterTrackerDisposer = observe(this.explorer.commonFilters.items, (change) => {
            if (change.type === 'add' || change.type === 'update') {
                this.applyFilter_(change.newValue);
            } else if (change.type === 'delete') {
                this.dataset.filters.unset(change.oldValue.key);
            }
        });

        this.explorer.commonFilters.items.forEach((filter) => {
            this.applyFilter_(filter);
        });

        this.subscriptionTracker_.addSubscription(filterTrackerDisposer);

        const timeExplorer = this.explorer.timeExplorer;
        const timeDistributionViz = this.timeDistributionViz;
        if (timeExplorer && timeDistributionViz) {
            const timeDistributionSearchParamsDisposer = autorun(() => {
                const active = timeExplorer.active;
                let timeRange = timeExplorer.visibleRange.range;
                if (active) {
                    timeDistributionViz.setSearchParams({
                        ...timeRange,
                        resolution: timeExplorer.visibleRange.resolution
                    });
                }
            });

            this.subscriptionTracker_.addSubscription(timeDistributionSearchParamsDisposer);
        }
    }

    protected applyFilter_(filter: QueryFilter) {
        const timeDistributionProvider = this.dataset.config.timeDistribution?.provider;
        if (
            filter.key === DATASET_SELECTED_TIME_FILTER_KEY
            && filter.value !== undefined
            && this.explorer.vizExplorer?.nearestMatch
            && timeDistributionProvider
        ) {

            if (this.pendingNearestTimeRequests_ && this.pendingNearestTimeRequests_.cancel) {
                this.pendingNearestTimeRequests_.cancel();
                this.pendingNearestTimeRequests_ = undefined;
            }
            this.pendingNearestTimeRequests_ = timeDistributionProvider.getNearestItem(
                filter.value, TimeSearchDirection.Backward
            ).then((item) => {
                let currentDatasetTime = this.dataset.filters.get(DATASET_SELECTED_TIME_FILTER_KEY)?.value;
                let nearestMatch = item ? item.start : filter.value;
                if (!currentDatasetTime || currentDatasetTime.getTime() !== nearestMatch.getTime()) {
                    this.dataset.filters.set(
                        DATASET_SELECTED_TIME_FILTER_KEY,
                        nearestMatch,
                        filter.type
                    );
                }
            });
        } else {
            this.dataset.filters.set(filter.key, filter.value, filter.type);
        }
    }
}

export class DatasetTimeExplorer {
    @observable.ref active: boolean;
    readonly visibleRange: TimeRange;

    constructor() {
        this.active = false;
        this.visibleRange = new TimeRange({
            start: moment().subtract(1, 'month').toDate(),
            end: moment().toDate(),
        });

        makeObservable(this);
    }

    @action
    setActive(active: boolean) {
        this.active = active;
    }
}

export class DatasetVizExplorer {
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
    disableTimeExplorer?: boolean;
    disableProductSearch?: boolean;
    disableMapView?: boolean;
};

export type DatasetsExplorerProps = {
    mapLayer: GroupLayer;
    config?: DatasetsExplorerConfig;
};

const randomColor = randomColorFactory();

export class DatasetExplorer {
    readonly config: DatasetsExplorerConfig;
    readonly mapLayer: GroupLayer;
    readonly commonFilters: DataFilters;
    readonly timeExplorer: DatasetTimeExplorer | undefined;
    readonly vizExplorer: DatasetVizExplorer | undefined;
    readonly analyses: DatasetAnalyses;
    readonly items = observable.array<DatasetExplorerItem>([], {deep: false});

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetsExplorerProps) {
        this.config = props.config || {};
        this.mapLayer = props.mapLayer;
        this.commonFilters = new DataFilters();
        if (!props.config?.disableTimeExplorer) {
            this.timeExplorer = new DatasetTimeExplorer();
        }
        if (!props.config?.disableMapView) {
            this.vizExplorer = new DatasetVizExplorer();
            this.mapLayer.children.add(this.vizExplorer.mapLayer);
        }

        this.analyses = new DatasetAnalyses({
            active: true
        });
        this.mapLayer.children.add(this.analyses.geometryLayer);

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();

        makeObservable(this);
    }

    @computed
    get aoi(): AoiValue | undefined {
        return this.commonFilters.get(DATASET_AOI_FILTER_KEY)?.value;
    }

    @computed
    get toi(): DateRangeValue | undefined {
        return this.commonFilters.get(DATASET_TIME_RANGE_FILTER_KEY)?.value;
    }

    @computed
    get selectedDate(): Date | undefined {
        return this.commonFilters.get(DATASET_SELECTED_TIME_FILTER_KEY)?.value;
    }

    @computed
    get shouldEnableTimeExplorer(): boolean {
        return this.timeExplorer !== undefined && this.items.some(dataset => !!dataset.timeDistributionViz);
    }

    @action
    setSelectedDate(date: Date | undefined) {
        this.commonFilters.set(DATASET_SELECTED_TIME_FILTER_KEY, date, DATE_FIELD_ID);
    }

    @action
    setToi(dateRange: DateRangeValue | undefined) {
        this.commonFilters.set(DATASET_TIME_RANGE_FILTER_KEY, dateRange, DATE_RANGE_FIELD_ID);
    }

    @action
    addDataset(datasetConfig: DatasetConfig) {

        if (!datasetConfig.color) {
            datasetConfig.color = randomColor();
        }
        const item = new DatasetExplorerItem({
            datasetConfig: datasetConfig,
            explorer: this
        });

        this.items.push(item);
        if (this.vizExplorer && item.mapViz?.mapLayer) {
            this.vizExplorer.mapLayer.children.add(item.mapViz.mapLayer, 0);
        }
    }

    @action
    removeDataset(datasetId: string) {
        let item = this.items.find(item => item.dataset.id === datasetId);
        if (item) {
            item.dispose();
            this.items.remove(item);

            if (this.vizExplorer && item.mapViz?.mapLayer) {
                this.vizExplorer.mapLayer.children.remove(item.mapViz.mapLayer);
            }
        }
    }

    @action
    moveDataset(idx, newIdx) {
        let item = this.items[idx];
        if (item) {
            this.items.splice(idx, 1);
            this.items.splice(newIdx, 0, item);

            if (this.vizExplorer && item.mapViz?.mapLayer) {
                this.vizExplorer.mapLayer.children.move(item.mapViz.mapLayer, this.items.length - newIdx - 1);
            }
        }
    }

    getDataset(datasetId: string) {
        return this.items.find(item => item.dataset.id === datasetId);
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
        this.items.forEach(item => item.dispose());
        this.items.clear();

        if (this.vizExplorer) {
            this.mapLayer.children.remove(this.vizExplorer.mapLayer);
        }
    }

    protected afterInit_() {
        const timeExplorer = this.timeExplorer;

        if (timeExplorer) {
            const autoTimeZoomDisposer = autorun(() => {
                let selectedDate = this.selectedDate;
                let toi = this.toi;
                if (selectedDate) {
                    timeExplorer.visibleRange.centerDate(selectedDate, {
                        notIfVisible: true,
                        animate: true
                    });
                } else if (toi) {
                    timeExplorer.visibleRange.centerRange(toi.start, toi.end, {
                        notIfVisible: true,
                        animate: true,
                        margin: 0.2
                    });
                }
            });

            this.subscriptionTracker_.addSubscription(autoTimeZoomDisposer);
        }
    }

}
