import { autorun, observable, makeObservable, action, computed } from 'mobx';

import { LoadingState, QueryFilter, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import { DatasetDimension, NumericVariable, DimensionDomainType } from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const RASTER_POINT_INFO_PRCESSING = 'raster_point_info_processing';

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
    dimensions: DatasetDimension<DimensionDomainType>[];
};

export type DatasetRasterPointInfoProps = Omit<
    DatasetProcessingProps<typeof RASTER_POINT_INFO_PRCESSING, DatasetRasterPointInfoConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    /**
     * when enabled the query time and other dimension values will be kept in sync with the parent
     * map visualization dimensions (if available)
     */
    trackParentViz?: boolean;
    autoUpdate?: boolean;
};

/**
 * An tool to extract the value on a point location of a raster dataset
 */
export class DatasetRasterPointInfo extends DatasetProcessing<typeof RASTER_POINT_INFO_PRCESSING, undefined> {
    readonly config: DatasetRasterPointInfoConfig;
    @observable.ref data: DatasetRasterPointData | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetRasterPointData | undefined, DatasetRasterPointInfoRequest>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetRasterPointInfoProps, 'vizType'>) {
        super({
            vizType: RASTER_POINT_INFO_PRCESSING,
            dimensions: props.config.dimensions,
            dimensionValues: props.dimensionValues || props.parent?.dimensions.values,
            initDimensions: false,
            ...props
        });

        this.config = props.config;
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
        return (
            !!this.aoi?.geometry.value &&
            this.config.dimensions.every((dim) => {
                return this.dimensions.values.has(dim.id);
            })
        );
    }

    retrieveData() {
        if (this.canRunQuery) {
            this.dataFetcher_
                .fetchData({
                    position: (this.aoi!.geometry.value as GeoJSON.Point).coordinates,
                    dimensionValues: new Map(this.dimensions.values),
                    additionalDatasetFilters: new Map(this.dataset.additionalFilters.items)
                })
                .then((data) => {
                    this.setData_(data);
                })
                .catch(() => {
                    this.setData_(undefined);
                });
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_(undefined);
        }
    }

    clone() {
        return this.clone_({
            config: this.config
        });
    }

    getSnapshot() {
        return {
            autoupdate: this.autoUpdate,
            ...super.getSnapshot()
        };
    }

    dispose() {
        super.dispose();
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
