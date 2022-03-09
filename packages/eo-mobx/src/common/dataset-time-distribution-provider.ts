import { DataDomainProviderFilters } from './dataset-variable';

export type TimeDistributionInstantItem = {
    start: Date;
    data?: {
        error?: boolean;
        loading?: boolean;
        count?: number;
        [x: string]: any;
    };
};

export type TimeDistributionRangeItem = TimeDistributionInstantItem & {
    end: Date;
};

export enum TimeSearchDirection {
    Forward = 'forward',
    Backward = 'backward'
}

export type TimeDomainProviderFilters = Omit<DataDomainProviderFilters, 'toi'>;
/**
 * The interface for a dataset time distribution provider. It allows to gather information about the dataset products time
 * availability.
 */
export interface DatasetTimeDistributionProvider {
    supportsHistograms(): boolean;

    /**
     * Set the default filters that will be used in the {@link DatasetTimeDistributionProvider.getTimeExtent},
     * {@link DatasetTimeDistributionProvider.getTimeDistribution}, {@link DatasetTimeDistributionProvider.getNearestItem}
     * calls
     *
     * @param filters: The default filters to set. The implementing class should store the default filters and use it
     * in subsequent time distribution calls. This is to allow a provider to cache the default time distribution data.
     *
     * @return A boolean indicating if the new filters affects the time distribution with respect to the previous default
     * filters
     */
    setDefaultFilters(filters: TimeDomainProviderFilters | null): boolean;

    /**
     * Get the dataset time extent
     * @param filters: Optional filters. When not provided the default filters
     * provided in the last call to {@link DatasetTimeDistributionProvider.setDefaultFilters} will be used
     * When set it overrides the default filters. Pass null for an unfiltered request
     *
     * @return The dataset time extent
     */
    getTimeExtent(filters?: TimeDomainProviderFilters | null): Promise<TimeDistributionRangeItem | undefined>;

    /**
     * Get the dataset time distribution for a time range
     *
     * @param timeRange: The request time range
     * @param filters: Optional filters. When not provided the default filters
     * provided in the last call to {@link DatasetTimeDistributionProvider.setDefaultFilters} will be used
     * When set it overrides the default filters. Pass null for an unfiltered request
     * @param resolution The requested distribution resolution in milliseconds.
     *
     * @return A promise resolving in the dataset time distribution for the provided parameters
     *
     **/
    getTimeDistribution(
        timeRange: { start: Date; end: Date },
        filters?: TimeDomainProviderFilters,
        resolution?: number
    ): Promise<(TimeDistributionRangeItem | TimeDistributionInstantItem)[]>;

    /**
     * Return the nearest dataset item given a specific date
     *
     * @param dt: The input date
     * @param direction: The direction to search for nearest item. If not provide
     * the closest item (future or past) to the provided date will be returned
     * @param filters: Optional filters. When not provided the default filters
     * provided in the last call to {@link DatasetTimeDistributionProvider.setDefaultFilters} will be used
     * When set it overrides the default filters. Pass null for an unfiltered request
     *
     * @return The dataset item closest to the provided date
     *
     **/
    getNearestItem(
        dt: Date,
        direction?: TimeSearchDirection,
        filters?: TimeDomainProviderFilters | null
    ): Promise<TimeDistributionInstantItem | undefined>;
}
