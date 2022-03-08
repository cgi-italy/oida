import moment from 'moment';

import {
    AxiosInstanceWithCancellation,
    createAxiosInstance,
    SortOrder,
    QueryParams,
    TimeInterval,
    TimeIntervalSet,
    DATE_RANGE_FIELD_ID,
    STRING_FIELD_ID,
    QueryFilter,
    AOI_FIELD_ID,
    areGeometriesEqual,
    AoiValue
} from '@oidajs/core';
import {
    DatasetTimeDistributionProvider,
    TimeSearchDirection,
    TimeDistributionRangeItem,
    DatasetProductSearchProvider,
    TimeDomainProviderFilters,
    TimeDistributionInstantItem
} from '@oidajs/eo-mobx';

export type AdamWcsTimeDistributionProviderConfig = {
    serviceUrl: string;
    isMultiBandCoverage?: boolean;
    axiosInstance?: AxiosInstanceWithCancellation;
    productCatalogue?: {
        provider: DatasetProductSearchProvider;
        timeRangeQueryParam: string;
        timeSortParam: string;
    };
    timeRange?: {
        start: Date;
        end: Date;
    };
};

export class AdamWcsTimeDistributionProvider implements DatasetTimeDistributionProvider {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected config_: AdamWcsTimeDistributionProviderConfig;
    protected timeExtent_: Promise<TimeDistributionRangeItem> | undefined;
    protected cswCache_ = {
        intervals: new TimeIntervalSet(),
        data: [] as TimeDistributionInstantItem[]
    };
    protected defaultFilters_: Record<string, QueryFilter> = {};

    constructor(config: AdamWcsTimeDistributionProviderConfig) {
        this.config_ = config;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        if (config.timeRange) {
            this.timeExtent_ = Promise.resolve(config.timeRange);
        }
    }

    setDefaultFilters(filters: TimeDomainProviderFilters) {
        const newDefaultFilters = this.getOpensearchFilters_(filters);
        if (this.shouldUpdateDefaultFilters_(newDefaultFilters)) {
            this.defaultFilters_ = newDefaultFilters;
            this.cswCache_ = {
                intervals: new TimeIntervalSet(),
                data: [] as any
            };
            this.timeExtent_ = undefined;
            return true;
        } else {
            return false;
        }
    }

    getTimeExtent(filters?: TimeDomainProviderFilters | null): Promise<TimeDistributionRangeItem | undefined> {
        const isDefaultRequest = filters === undefined;
        if (!this.timeExtent_ || !isDefaultRequest) {
            const productCatalogue = this.config_.productCatalogue;
            if (!productCatalogue || !productCatalogue.timeSortParam) {
                return Promise.resolve(undefined);
            }

            const commonFilters = isDefaultRequest
                ? Object.values(this.defaultFilters_)
                : Object.values(this.getOpensearchFilters_(filters));

            const rangeStartQueryParams: QueryParams = {
                paging: {
                    page: 0,
                    offset: 0,
                    pageSize: 1
                },
                filters: commonFilters,
                sortBy: {
                    key: productCatalogue.timeSortParam,
                    order: SortOrder.Ascending
                }
            };

            const rangeEndQueryParams: QueryParams = {
                paging: {
                    page: 0,
                    offset: 0,
                    pageSize: 1
                },
                filters: commonFilters,
                sortBy: {
                    key: productCatalogue.timeSortParam,
                    order: SortOrder.Descending
                }
            };

            const timeExtent = Promise.all([
                productCatalogue.provider.searchProducts(rangeStartQueryParams),
                productCatalogue.provider.searchProducts(rangeEndQueryParams)
            ]).then(([firstItem, lastItem]) => {
                return {
                    start: firstItem.results[0].start,
                    end: lastItem.results[0].end || lastItem.results[0].start,
                    data: {
                        count: firstItem.total
                    }
                } as TimeDistributionRangeItem;
            });

            if (isDefaultRequest) {
                this.timeExtent_ = timeExtent;
            }

            return timeExtent;
        } else {
            return this.timeExtent_;
        }
    }

    supportsHistograms() {
        return false;
    }

    getTimeDistribution(timeRange, filters?: TimeDomainProviderFilters | null, resolution?: number) {
        resolution = resolution || 1;
        const isDefaultRequest = filters === undefined;

        return this.getTimeExtent(filters).then((timeExtent) => {
            if (timeExtent) {
                if (timeRange.end < timeExtent.start || timeRange.start > timeExtent.end!) {
                    return [];
                } else {
                    if (!this.config_.productCatalogue) {
                        return [timeExtent];
                    } else {
                        const overlapStart = timeRange.start > timeExtent.start ? timeRange.start : timeExtent.start;
                        const overlapEnd = timeRange.end < timeExtent.end! ? timeRange.end : timeExtent.end;

                        const requestInterval = new TimeInterval(overlapStart, overlapEnd);

                        if (isDefaultRequest) {
                            const missingIntervals = this.cswCache_.intervals.getMissingIntervals(requestInterval);

                            if (!missingIntervals.length) {
                                return this.getTimeDistributionFromCache_(requestInterval, filters, resolution);
                            } else {
                                const maxItems = 200;

                                const requests = missingIntervals.map((interval) => {
                                    return this.getRecordsForInterval_(interval, filters, maxItems);
                                });

                                return Promise.all(requests).then((responses) => {
                                    return this.getTimeDistributionFromCache_(requestInterval, filters, resolution);
                                });
                            }
                        } else {
                            return this.getRecordsForInterval_(requestInterval, filters, 500).then((records) => {
                                return this.getAggregatedTimeDistribution(records, resolution);
                            });
                        }
                    }
                }
            } else {
                return [];
            }
        });
    }

    getNearestItem(dt: Date, direction?: TimeSearchDirection, filters?: TimeDomainProviderFilters | null) {
        return this.getTimeExtent(filters).then((timeExtent) => {
            if (!timeExtent) {
                return undefined;
            } else if (dt.getTime() === (timeExtent.start as Date).getTime()) {
                return {
                    start: dt
                };
            } else if (dt.getTime() === (timeExtent.end as Date).getTime()) {
                return {
                    start: dt
                };
            } else if (dt > timeExtent.end!) {
                if (direction === TimeSearchDirection.Forward) {
                    return undefined;
                } else {
                    return {
                        start: timeExtent.end as Date
                    };
                }
            } else if (dt < timeExtent.start) {
                if (direction === TimeSearchDirection.Backward) {
                    return undefined;
                } else {
                    return {
                        start: timeExtent.start as Date
                    };
                }
            } else {
                const isDefaultRequest = filters === undefined;
                if (direction) {
                    let nearestItem: TimeDistributionInstantItem | undefined | Promise<TimeDistributionInstantItem | undefined> =
                        isDefaultRequest ? this.getNearestItemFromCache_(timeExtent, dt, direction) : undefined;
                    if (!nearestItem) {
                        nearestItem = this.getNearestItemFromCatalogue_(dt, direction, filters);
                    }
                    return nearestItem;
                } else {
                    return Promise.all([
                        Promise.resolve(
                            isDefaultRequest
                                ? this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Backward)
                                : Promise.resolve(undefined)
                        ).then((item) => {
                            if (!item) {
                                return this.getNearestItemFromCatalogue_(dt, TimeSearchDirection.Backward, filters);
                            } else {
                                return item;
                            }
                        }),
                        Promise.resolve(
                            isDefaultRequest
                                ? this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Forward)
                                : Promise.resolve(undefined)
                        ).then((item) => {
                            if (!item) {
                                return this.getNearestItemFromCatalogue_(dt, TimeSearchDirection.Forward, filters);
                            } else {
                                return item;
                            }
                        })
                    ]).then(([prev, next]) => {
                        if (!prev) {
                            return next;
                        } else if (!next) {
                            return prev;
                        } else {
                            const prevDistance = dt.getTime() - prev.start.getTime();
                            const nextDistance = next.start.getTime() - dt.getTime();
                            if (prevDistance <= nextDistance) {
                                return prev;
                            } else {
                                return next;
                            }
                        }
                    });
                }
            }
        });
    }

    /**
     * Add an array of ordered items to the cache
     * @param items The items to add to the cache. The array should be in asceding start date order
     */
    protected addItemsToCache_(items: TimeDistributionInstantItem[]) {
        if (items.length) {
            const maxDate = items[items.length - 1].start;

            // find the insertion point
            let idx = this.cswCache_.data.findIndex((item) => item.start.getTime() >= maxDate.getTime());
            if (idx === -1) {
                idx = this.cswCache_.data.length;
            }

            // remove any duplicated item at beginning
            const prevItemInCache = this.cswCache_.data[idx - 1];
            if (prevItemInCache) {
                while (items.length && items[0].start.getTime() <= prevItemInCache.start.getTime()) {
                    items.splice(0, 1);
                }
            }
            if (!items.length) {
                return;
            }

            // remove any duplicated item at end
            const nextItemInCache = this.cswCache_.data[idx];
            if (nextItemInCache) {
                while (items.length && items[items.length - 1].start.getTime() >= nextItemInCache.start.getTime()) {
                    items.splice(items.length - 1, 1);
                }
            }

            this.cswCache_.data.splice(idx, 0, ...items);
        }
    }

    protected getNearestItemFromCache_(timeExtent, dt: Date, direction: TimeSearchDirection) {
        if (direction === TimeSearchDirection.Forward) {
            const nearestItem = this.cswCache_.data.find((item) => item.start >= dt);
            // check that the interval between the requested date and the cached item is all cached
            // (otherwise maybe there is a nearest item in between)
            if (nearestItem && this.cswCache_.intervals.isIntervalIncluded(new TimeInterval(dt, nearestItem.start))) {
                return nearestItem;
            }
        } else {
            const nearestItem = this.cswCache_.data
                .slice()
                .reverse()
                .find((item) => item.start <= dt);
            if (nearestItem && this.cswCache_.intervals.isIntervalIncluded(new TimeInterval(nearestItem.start, dt))) {
                return nearestItem;
            }
        }

        return undefined;
    }

    protected getNearestItemFromCatalogue_(
        dt: Date,
        direction: TimeSearchDirection,
        requestFilters?: TimeDomainProviderFilters | null
    ): Promise<TimeDistributionInstantItem | undefined> {
        const productCatalogue = this.config_.productCatalogue;

        if (!productCatalogue) {
            return Promise.resolve(undefined);
        }

        let params: QueryParams;

        const isDefaultRequest = requestFilters === undefined;
        const commonFilters = isDefaultRequest
            ? Object.values(this.defaultFilters_)
            : Object.values(this.getOpensearchFilters_(requestFilters));

        if (direction === TimeSearchDirection.Forward) {
            params = {
                paging: {
                    page: 0,
                    offset: 0,
                    pageSize: 1
                },
                filters: [
                    {
                        key: productCatalogue.timeRangeQueryParam,
                        value: {
                            start: dt
                        },
                        type: DATE_RANGE_FIELD_ID
                    },
                    ...commonFilters
                ],
                sortBy: productCatalogue.timeSortParam
                    ? {
                          key: productCatalogue.timeSortParam,
                          order: SortOrder.Ascending
                      }
                    : undefined
            };
        } else {
            params = {
                paging: {
                    page: 0,
                    offset: 0,
                    pageSize: 1
                },
                filters: [
                    {
                        key: productCatalogue.timeRangeQueryParam,
                        value: {
                            end: dt
                        },
                        type: DATE_RANGE_FIELD_ID
                    },
                    ...commonFilters
                ],
                sortBy: productCatalogue.timeSortParam
                    ? {
                          key: productCatalogue.timeSortParam,
                          order: SortOrder.Descending
                      }
                    : undefined
            };
        }

        return productCatalogue.provider.searchProducts(params).then((response) => {
            const item = response.results[0];
            if (item && isDefaultRequest) {
                // add item to the cache
                const cachedItem = this.cswCache_.data.find((cachedItem) => item.start.getTime() === cachedItem.start.getTime());
                if (!cachedItem) {
                    this.addItemsToCache_([
                        {
                            start: item.start
                        }
                    ]);
                }
                if (direction === TimeSearchDirection.Forward) {
                    this.cswCache_.intervals.addInterval(new TimeInterval(dt, item.start));
                } else {
                    this.cswCache_.intervals.addInterval(new TimeInterval(item.start, dt));
                }
            }
            return item
                ? {
                      start: item.start as Date
                  }
                : undefined;
        });
    }

    protected getTimeDistributionFromCache_(timeInterval: TimeInterval, filters?: TimeDomainProviderFilters | null, resolution?: number) {
        const distributionItems: (TimeDistributionInstantItem | TimeDistributionRangeItem)[] = [];

        const startIdx = this.cswCache_.data.findIndex((item) => {
            return timeInterval.start.isSameOrBefore(item.start);
        });

        if (startIdx !== -1) {
            for (let i = startIdx; i < this.cswCache_.data.length; ++i) {
                if (timeInterval.end.isBefore(this.cswCache_.data[i].start)) {
                    break;
                }
                distributionItems.push(this.cswCache_.data[i]);
            }
        }

        // TODO: the complexity here is O(N^2). The number of items should be small but we should
        // probably use a more efficient implementation (e.g. binary search)
        this.cswCache_.intervals.getMissingIntervals(timeInterval).forEach((interval) => {
            const insertionIdx = distributionItems.findIndex((item) => {
                return interval.start.isBefore(item.start);
            });

            if (insertionIdx !== -1) {
                distributionItems.splice(insertionIdx, 0, {
                    start: interval.start.toDate(),
                    end: interval.end.toDate()
                });
            } else {
                distributionItems.push({
                    start: interval.start.toDate(),
                    end: interval.end.toDate()
                });
            }
        });

        return this.getAggregatedTimeDistribution(distributionItems, resolution);
    }

    protected getAggregatedTimeDistribution(items: (TimeDistributionInstantItem | TimeDistributionRangeItem)[], resolution?: number) {
        if (!items.length) {
            return items;
        }

        const distribution: (TimeDistributionInstantItem | TimeDistributionRangeItem)[] = [];

        let lastItem = {
            start: items[0].start,
            end: (items[0] as TimeDistributionRangeItem).end || items[0].start
        };

        resolution = resolution || 1;

        items.slice(1).forEach((item) => {
            if (item.start.getTime() - lastItem.end.getTime() < resolution!) {
                lastItem.end = (item as TimeDistributionRangeItem).end || item.start;
            } else {
                distribution.push(lastItem);
                lastItem = {
                    start: item.start,
                    end: (item as TimeDistributionRangeItem).end || item.start
                };
            }
        });

        distribution.push(lastItem);

        return distribution;
    }

    protected async getRecordsForInterval_(interval: TimeInterval, requestFilters?: TimeDomainProviderFilters | null, maxItems?: number) {
        const productCatalogue = this.config_.productCatalogue;
        if (!productCatalogue) {
            throw new Error('No product catalogue configuration provided');
        }
        const pageSize = maxItems ? Math.min(maxItems, 200) : 200;
        let page = 0;

        const isDefaultRequest = requestFilters === undefined;
        const commonFilters = isDefaultRequest
            ? Object.values(this.defaultFilters_)
            : Object.values(this.getOpensearchFilters_(requestFilters));

        const filters: QueryFilter[] = [
            ...commonFilters,
            {
                key: productCatalogue.timeRangeQueryParam,
                value: {
                    start: interval.start.toDate(),
                    end: interval.end.toDate()
                },
                type: DATE_RANGE_FIELD_ID
            }
        ];

        const data: (TimeDistributionInstantItem | TimeDistributionRangeItem)[] = [];

        const retrievePage = () => {
            return productCatalogue.provider
                .searchProducts({
                    paging: {
                        page: page,
                        offset: page * pageSize,
                        pageSize: pageSize
                    },
                    filters: filters,
                    sortBy: productCatalogue.timeSortParam
                        ? {
                              key: productCatalogue.timeSortParam,
                              order: SortOrder.Ascending
                          }
                        : undefined
                })
                .then((response) => {
                    let prevDate: Date | undefined;
                    const items = response.results
                        .filter((record) => {
                            const keep = record.start.getTime() !== prevDate?.getTime();
                            prevDate = record.start;
                            return keep;
                        })
                        .map((record) => {
                            return {
                                start: record.start
                            };
                        });

                    data.push(...items);
                    if (isDefaultRequest) {
                        this.addItemsToCache_(items);
                    }
                    return response;
                });
        };

        if (isDefaultRequest) {
            this.cswCache_.intervals.addInterval(interval);
        }
        let response;
        do {
            response = await retrievePage();
            if (maxItems && response.total > maxItems) {
                const missingInterval = new TimeInterval(data[data.length - 1].start, interval.end.toDate());
                data.push({
                    start: missingInterval.start.toDate(),
                    end: missingInterval.end.toDate(),
                    data: {
                        count: response.total - data.length
                    }
                });
                if (isDefaultRequest) {
                    this.cswCache_.intervals.removeInterval(missingInterval);
                }
                break;
            }

            page++;
        } while (response.total > page * pageSize);

        return data;
    }

    protected getOpensearchFilters_(domainFilters?: TimeDomainProviderFilters | null) {
        const filters: Record<string, QueryFilter> = {};
        if (domainFilters?.aoi) {
            filters.geometry = {
                key: 'geometry',
                type: AOI_FIELD_ID,
                value: domainFilters.aoi
            };
        }
        // in multiband datasets the variable is the band number, while for single
        // band coverage the variable maps to the subdataset id
        if (domainFilters?.variable && !this.config_.isMultiBandCoverage) {
            filters.subDatasetId = {
                key: 'subDatasetId',
                type: STRING_FIELD_ID,
                value: domainFilters.variable
            };
        }
        domainFilters?.dimensionValues?.forEach((value, key) => {
            if (key === 'subdataset') {
                filters.subDatasetId = {
                    key: 'subDatasetId',
                    type: STRING_FIELD_ID,
                    value: value
                };
            } else if (key !== 'time') {
                filters['key'] = {
                    key: key,
                    type: STRING_FIELD_ID,
                    value: value
                };
            }
        });
        return filters;
    }

    protected shouldUpdateDefaultFilters_(filters?: Record<string, QueryFilter>) {
        if (Object.keys(filters || {}).length !== Object.keys(this.defaultFilters_).length) {
            return true;
        }
        return Object.entries(filters || {}).some(([key, filter]) => {
            if (filter.type === AOI_FIELD_ID) {
                const value = filter.value as AoiValue;
                const currentAoi = this.defaultFilters_.aoi;
                if (!currentAoi) {
                    return true;
                } else {
                    return !areGeometriesEqual(value.geometry, currentAoi.value.geometry);
                }
            } else {
                return filter.value !== this.defaultFilters_[filter.key]?.value;
            }
        });
    }
}
