import {  QueryFilter } from '@oida/core';

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
    getTimeDistribution: (timeRange: {start: Date, end: Date}, filters: QueryFilter[], resolution?: number) => Promise<
        (TimeDistributionRangeItem | TimeDistributionInstantItem)[]
    >;
    getTimeExtent: (filters?: QueryFilter[]) => Promise<TimeDistributionRangeItem | undefined>;
    getNearestItem: (dt: Date, direction: TimeSearchDirection) => Promise<TimeDistributionInstantItem | undefined>;
}
