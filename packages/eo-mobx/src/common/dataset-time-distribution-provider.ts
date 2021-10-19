import { DataDomainProviderFilters } from './dataset-variable';

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
    getTimeDistribution: (timeRange: {start: Date, end: Date}, filters?: DataDomainProviderFilters, resolution?: number) => Promise<
        (TimeDistributionRangeItem | TimeDistributionInstantItem)[]
    >;
    getTimeExtent: (filters?: DataDomainProviderFilters) => Promise<TimeDistributionRangeItem | undefined>;
    getNearestItem: (
        dt: Date, direction?: TimeSearchDirection, filters?: DataDomainProviderFilters
    ) => Promise<TimeDistributionInstantItem | undefined>;
}
