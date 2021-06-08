import { autorun, observable, makeObservable, action, computed } from 'mobx';

import { LoadingState, QueryFilter, SubscriptionTracker } from '@oida/core';
import { AsyncDataFetcher, MapLayer } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, NumericVariable } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { DatasetViz } from './dataset-viz';


export const RASTER_POINT_INFO_TYPE = 'raster_point_info';

type DimensionType = string | Date | number;

export type DatasetRasterPointInfoRequest = {
    position: GeoJSON.Position;
    dimensionValues?: Map<string, DimensionType>;
    additionalDatasetFilters?: Map<string, QueryFilter>;
};

export type DatasetRasterPointData = Record<string, number>;

export type DatasetRasterPointInfoProvider = (request: DatasetRasterPointInfoRequest) => Promise<DatasetRasterPointData | undefined>;

export type DatasetRasterPointInfoConfig = {
    variables: NumericVariable[];
    provider: DatasetRasterPointInfoProvider;
    dimensions: DatasetDimension<DataDomain<DimensionType>>[];
};


export type DatasetRasterPointInfoProps = {
    /**
     * when enabled the query time and other dimension values will be kept in sync with the parent
     * map visualization dimensions (if available)
     */
    trackParentViz?: boolean;
    autoUpdate?: boolean;
    parent?: DatasetViz<MapLayer | undefined> & Partial<HasDatasetDimensions>
} & Omit<DatasetAnalysisProps<typeof RASTER_POINT_INFO_TYPE, DatasetRasterPointInfoConfig>, 'parent'> & DatasetDimensionsProps;

/**
 * An tool to extract the value on a point location of a raster dataset
 */
export class DatasetRasterPointInfo extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly parent: (DatasetViz<MapLayer | undefined> & Partial<HasDatasetDimensions>) | undefined;
    readonly config: DatasetRasterPointInfoConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref data: DatasetRasterPointData | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetRasterPointData | undefined, DatasetRasterPointInfoRequest>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetRasterPointInfoProps, 'vizType'>) {
        super({
            vizType: RASTER_POINT_INFO_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.data = undefined;
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 100 : 0
        });
        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_(props.trackParentViz);
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
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
        && this.config.dimensions.every((dim) => {
            return this.dimensions.values.has(dim.id);
        });
    }

    retrieveData() {
        if (this.canRunQuery) {
            this.dataFetcher_.fetchData({
                position: (this.aoi!.geometry.value as GeoJSON.Point).coordinates,
                dimensionValues: new Map(this.dimensions.values),
                additionalDatasetFilters: new Map(this.dataset.additionalFilters.items)
            }).then((data) => {
                this.setData_(data);
            }).catch(() => {
                this.setData_(undefined);
            });
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_(undefined);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            dimensionValues: this.dimensions.values
        }) as DatasetRasterPointInfo;
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_(trackParentViz?: boolean) {

        if (trackParentViz) {
            const parentTrackerDisposer = autorun(() => {
                this.syncParentDimensions_();
            });

            this.subscriptionTracker_.addSubscription(parentTrackerDisposer);
        } else {
            this.syncParentDimensions_();
        }

        const dataUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                if (!trackParentViz || this.parent?.mapLayer?.visible.value) {
                    this.retrieveData();
                } else {
                    this.setData_(undefined);
                }
            }
        });

        this.subscriptionTracker_.addSubscription(dataUpdaterDisposer);
    }

    @action
    protected setData_(data: DatasetRasterPointData | undefined) {
        this.data = data;
    }

    protected syncParentDimensions_() {
        const timeDimension = this.config.dimensions.find((dimension) => dimension.id === 'time');
        if (timeDimension) {
            const datasetTime = this.dataset.toi;
            if (datasetTime) {
                if (datasetTime instanceof Date) {
                    this.dimensions.setValue('time', datasetTime);
                }
            }
        }
        this.parent?.dimensions?.values.forEach((value, key) => {
            this.dimensions.setValue(key, value);
        });
    }

    protected initMapLayer_() {
        return undefined;
    }
}

