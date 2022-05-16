import { observable, makeObservable, action, autorun } from 'mobx';

import { SubscriptionTracker } from '@oidajs/core';

import {
    DatasetViz,
    DatasetVizProps,
    DatasetTimeDistributionConfig,
    DataDomainProviderFilters,
    TimeDistributionInstantItem,
    TimeDistributionRangeItem,
    TimeDomainProviderFilters
} from '../common';
import { TimeDistribution } from './time-distribution';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

export const TIME_DISTRIBUTION_VIZ_TYPE = 'time_distribution';

export type DatasetTimeDistributionSearchParams = {
    start: Date;
    end: Date;
    resolution?: number;
};

export type DatasetTimeDistributionVizProps = {
    config: DatasetTimeDistributionConfig;
} & Omit<DatasetVizProps, 'vizType'>;

/**
 * A class to manage a dataset time distribution. Automatically created as part of {@link DatasetExplorerItem}
 * so no need to instantiate it directly except for its use outside of {@link DatasetExplorer}
 */
export class DatasetTimeDistributionViz extends DatasetViz<undefined> {
    readonly config: DatasetTimeDistributionConfig;
    readonly timeDistribution: TimeDistribution<any>;
    @observable.ref searchParams: DatasetTimeDistributionSearchParams | undefined;
    @observable distributionRevision: number;

    protected distributionFetcher_: AsyncDataFetcher<
        (TimeDistributionInstantItem | TimeDistributionRangeItem)[],
        {
            timeRange: { start: Date; end: Date };
            filters?: DataDomainProviderFilters;
            resolution?: number;
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
        this.distributionRevision = 0;

        this.distributionFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                this.timeDistribution.setItems([
                    {
                        start: params.timeRange.start,
                        end: params.timeRange.end,
                        data: {
                            loading: true
                        }
                    }
                ]);
                return this.config.provider.getTimeDistribution(params.timeRange, params.filters, params.resolution);
            },
            debounceInterval: 1000
        });
        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get filters(): TimeDomainProviderFilters {
        return this.parent ? this.parent.dimensions : this.dimensions;
    }

    @action
    setSearchParams(params: DatasetTimeDistributionSearchParams | undefined) {
        this.searchParams = params;
        this.updateDistributionData_();
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {
        const filterTrackerDisposer = autorun(() => {
            if (this.config.provider.setDefaultFilters(this.filters)) {
                setTimeout(() => {
                    this.distributionRevision++;
                    this.updateDistributionData_();
                }, 0);
            }
        });

        this.subscriptionTracker_.addSubscription(filterTrackerDisposer);
    }

    protected updateDistributionData_() {
        const searchParams = this.searchParams;
        if (searchParams) {
            const resolution = searchParams.resolution || Math.round((searchParams.end.getTime() - searchParams.start.getTime()) / 100);

            this.distributionFetcher_
                .fetchData({
                    timeRange: {
                        start: searchParams.start,
                        end: searchParams.end
                    },
                    resolution: resolution
                })
                .then((items) => {
                    this.timeDistribution.setItems(items);
                })
                .catch((e) => {
                    this.timeDistribution.setItems([
                        {
                            start: searchParams.start,
                            end: searchParams.end,
                            data: {
                                error: true
                            }
                        }
                    ]);
                });
        } else {
            this.distributionFetcher_.cancelPendingRequest();
        }
    }
    protected initMapLayer_() {
        return undefined;
    }
}
