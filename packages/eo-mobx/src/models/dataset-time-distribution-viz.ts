import { observable, makeObservable, action, autorun } from 'mobx';
import debounce from 'lodash/debounce';

import { QueryFilter } from '@oida/core';

import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { DatasetTimeDistributionConfig } from '../types';
import { TimeDistribution } from './time-distribution';


export type DatasetTimeDistributionSearchParams = {
    start: Date,
    end: Date,
    resolution?: number
};

type TimeDistributionUpdaterOptions = {
    debounceTimeout?: number;
};

const timeDistributionUpdater = (timeDistributionViz: DatasetTimeDistributionViz, options: TimeDistributionUpdaterOptions = {}) => {

    const defaultResolutionFactor = 100;
    let pendingRequest: Promise<any> | undefined = undefined;

    let debounceSet = debounce((searchParams: DatasetTimeDistributionSearchParams, filters: QueryFilter[]) => {

        timeDistributionViz.timeDistribution.setItems([{
            start: searchParams.start,
            end: searchParams.end,
            data: {
                loading: true
            }
        }]);

        let stepDuration = searchParams.resolution ||
            Math.round((searchParams.end.getTime() - searchParams.start.getTime()) / defaultResolutionFactor);

        pendingRequest = timeDistributionViz.config.provider.getTimeDistribution(searchParams, filters, stepDuration).then((items) => {
            timeDistributionViz.timeDistribution.setItems(items);
        }).catch((e) => {
            timeDistributionViz.timeDistribution.setItems([{
                start: searchParams.start,
                end: searchParams.end,
                data: {
                    error: true
                }
            }]);
        });

    }, options.debounceTimeout || 1000);

    let disposer = autorun(() => {
        if (pendingRequest) {
            if (pendingRequest.cancel) {
                pendingRequest.cancel();
            } else {
                pendingRequest.isCanceled = true;
            }
            pendingRequest = undefined;
        }
        let searchParams = timeDistributionViz.searchParams ? {...timeDistributionViz.searchParams} : undefined;
        if (searchParams) {
            let filters = timeDistributionViz.dataset.filters.asArray();
            debounceSet(searchParams, filters);
        } else {
            debounceSet.cancel();
        }
    });

    return disposer;
};

export const TIME_DISTRIBUTION_VIZ_TYPE = 'time_distribution';

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

    constructor(props: DatasetTimeDistributionVizProps) {
        super({
            ...props,
            vizType: TIME_DISTRIBUTION_VIZ_TYPE
        });

        this.config = props.config;
        this.timeDistribution = new TimeDistribution();
        this.searchParams = undefined;

        makeObservable(this);

        this.afterInit_();
    }

    @action
    setSearchParams(params: DatasetTimeDistributionSearchParams | undefined) {
        this.searchParams = params;
    }

    protected afterInit_() {
        timeDistributionUpdater(this);
    }

    protected initMapLayer_() {
        return undefined;
    }
}
