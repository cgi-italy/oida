import { observable, makeObservable, action, autorun } from 'mobx';

import { SubscriptionTracker } from '@oidajs/core';

import {
    DatasetViz, DatasetVizProps, DatasetTimeDistributionConfig, hasDatasetDimensions,
    DataDomainProviderFilters, TimeDistributionInstantItem, TimeDistributionRangeItem
} from '../common';
import { TimeDistribution } from './time-distribution';
import { AsyncDataFetcher } from '@oidajs/state-mobx';


export const TIME_DISTRIBUTION_VIZ_TYPE = 'time_distribution';


export type DatasetTimeDistributionSearchParams = {
    start: Date,
    end: Date,
    resolution?: number
};

export type DatasetTimeDistributionVizProps = {
    config: DatasetTimeDistributionConfig
} & Omit<DatasetVizProps, 'vizType'>;


/**
 * A class to manage a dataset time distribution. Automatically created as part of {@link DatasetExplorerItem}
 * so no need to instantiate it directly except for its use outside of {@link DatasetExplorer}
 */
export class DatasetTimeDistributionViz extends DatasetViz<undefined> {

    readonly config: DatasetTimeDistributionConfig;
    readonly timeDistribution: TimeDistribution<any>;
    @observable.ref searchParams: DatasetTimeDistributionSearchParams | undefined;

    protected distributionFetcher_: AsyncDataFetcher<
        (TimeDistributionInstantItem | TimeDistributionRangeItem)[],
        {
            timeRange: {start: Date, end: Date},
            filters?: DataDomainProviderFilters,
            resolution?: number
        }
    >;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: DatasetTimeDistributionVizProps) {
        super({
            ...props,
            vizType: TIME_DISTRIBUTION_VIZ_TYPE
        });

        this.config = props.config;
        this.timeDistribution = new TimeDistribution();
        this.searchParams = undefined;

        this.distributionFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                this.timeDistribution.setItems([{
                    start: params.timeRange.start,
                    end: params.timeRange.end,
                    data: {
                        loading: true
                    }
                }]);
                return this.config.provider.getTimeDistribution(params.timeRange, params.filters, params.resolution);
            },
            debounceInterval: 1000
        });
        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get filters(): DataDomainProviderFilters | undefined {
        return hasDatasetDimensions(this.parent) ? this.parent.dimensions : {
            aoi: this.dataset.aoi,
            additionaFilters: this.dataset.additionalFilters.items
        };
    }

    @action
    setSearchParams(params: DatasetTimeDistributionSearchParams | undefined) {
        this.searchParams = params;
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        const distributionUpdateDisposer = autorun(() => {
            const searchParams = this.searchParams;
            if (searchParams) {

                const resolution = searchParams.resolution ||
                Math.round((searchParams.end.getTime() - searchParams.start.getTime()) / 100);

                this.distributionFetcher_.fetchData({
                    timeRange: {
                        start: searchParams.start,
                        end: searchParams.end
                    },
                    filters: this.filters,
                    resolution: resolution
                }).then((items) => {
                    this.timeDistribution.setItems(items);
                }).catch((e) => {
                    this.timeDistribution.setItems([{
                        start: searchParams.start,
                        end: searchParams.end,
                        data: {
                            error: true
                        }
                    }]);
                });
            } else {
                this.distributionFetcher_.cancelPendingRequest();
            }
        });

        this.subscriptionTracker_.addSubscription(distributionUpdateDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}
