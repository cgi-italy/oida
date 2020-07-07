import {  CancelablePromise, QueryFilter } from '@oida/core';

export type TimeDistributionInstantItem = {
    start: Date,
    data?: any
};

export type TimeDistributionRangeItem = TimeDistributionInstantItem & {
    end: Date,
};

export enum TimeSearchDirection {
    Forward = 'forward',
    Backward = 'backward'
}
export interface DatasetTimeDistributionProvider {
    supportsHistograms: () => boolean;
    getTimeDistribution: (timeRange, filters, resolution?) => CancelablePromise<
        (TimeDistributionRangeItem | TimeDistributionInstantItem)[]
    >;
    getTimeExtent: (filters?: QueryFilter[]) => CancelablePromise<TimeDistributionRangeItem | undefined>;
    getNearestItem: (dt: Date, direction: TimeSearchDirection) => CancelablePromise<TimeDistributionInstantItem | undefined>;
}
