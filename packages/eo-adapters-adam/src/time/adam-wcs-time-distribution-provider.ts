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
    ProductSearchRecord,
    TimeDomainProviderFilters
} from '@oidajs/eo-mobx';

export type AdamWcsTimeDistributionProviderConfig = {
    serviceUrl: string;
    coverageId: string;
    axiosInstance?: AxiosInstanceWithCancellation;
    productCatalogue?: {
        provider: DatasetProductSearchProvider;
        timeRangeQueryParam: string;
        timeSortParam?: string;
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
        data: [] as any[]
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
                    let count = timeExtent.data?.count || 1;
                    if (!this.config_.productCatalogue) {
                        return [timeExtent];
                    } else {
                        const overlapStart = timeRange.start > timeExtent.start ? timeRange.start : timeExtent.start;
                        const overlapEnd = timeRange.end < timeExtent.end! ? timeRange.end : timeExtent.end;

                        const overlapSpan = overlapEnd.getTime() - overlapStart.getTime();
                        const extentSpan = (timeExtent.end as Date).getTime() - (timeExtent.start as Date).getTime();

                        count = count * (overlapSpan / extentSpan); // assuming uniform distribution
                        if (overlapSpan / count > resolution!) {
                            if (isDefaultRequest) {
                                const missingIntervals = this.cswCache_.intervals.addInterval(new TimeInterval(overlapStart, overlapEnd));

                                const maxItems = Math.ceil(overlapSpan / resolution!) * 1.5;
                                if (!missingIntervals.length) {
                                    const items = this.cswCache_.data.filter(
                                        (item) => item.start >= overlapStart && item.start <= overlapEnd
                                    );
                                    if (items.length > maxItems) {
                                        return [
                                            {
                                                start: items[0].start,
                                                end: items[items.length - 1].end
                                            }
                                        ];
                                    } else {
                                        return items;
                                    }
                                } else {
                                    const requests: Promise<Array<{ start: Date; end: Date; aggregated?: boolean }>>[] =
                                        missingIntervals.map((interval) => {
                                            const intervalSpan = interval.end.diff(interval.start);
                                            const maxItems = Math.ceil((intervalSpan / resolution!) * 1.5);
                                            return this.getRecordsForInterval_(interval, filters, maxItems)
                                                .then((records) => {
                                                    if (records.length === 1 && records[0].metadata?.isAggregated) {
                                                        this.cswCache_.intervals.removeInterval(interval);
                                                        return [
                                                            {
                                                                start: records[0].start as Date,
                                                                end: records[0].end as Date,
                                                                aggregated: true
                                                            }
                                                        ];
                                                    } else {
                                                        const items = records.map((item) => {
                                                            return {
                                                                start: item.start as Date,
                                                                end: (item.end || item.start) as Date
                                                            };
                                                        });
                                                        this.addCachedItems_(items);
                                                        return items;
                                                    }
                                                })
                                                .catch((error) => {
                                                    this.cswCache_.intervals.removeInterval(interval);
                                                    return [];
                                                });
                                        });

                                    return Promise.all(requests).then((responses) => {
                                        let cachedItems = this.cswCache_.data.filter(
                                            (item) => item.start >= overlapStart && item.start <= overlapEnd
                                        );
                                        if (cachedItems.length > maxItems) {
                                            cachedItems = [
                                                {
                                                    start: cachedItems[0].start,
                                                    end: cachedItems[cachedItems.length - 1].end
                                                }
                                            ];
                                        }
                                        responses.forEach((response) => {
                                            if (response.length === 1 && response[0].aggregated) {
                                                cachedItems.push(response[0]);
                                            }
                                        });

                                        return cachedItems;
                                    });
                                }
                            } else {
                                const maxItems = Math.ceil(overlapSpan / resolution!) * 1.5;
                                return this.getRecordsForInterval_(new TimeInterval(overlapStart, overlapEnd), filters, maxItems).then(
                                    (records) => {
                                        if (records.length === 1 && records[0].metadata?.isAggregated) {
                                            return [
                                                {
                                                    start: records[0].start as Date,
                                                    end: records[0].end as Date,
                                                    aggregated: true
                                                }
                                            ];
                                        } else {
                                            return records.map((item) => {
                                                return {
                                                    start: item.start as Date,
                                                    end: (item.end || item.start) as Date
                                                };
                                            });
                                        }
                                    }
                                );
                            }
                        } else {
                            return [timeExtent];
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
                    start: dt,
                    end: dt
                };
            } else if (dt.getTime() === (timeExtent.end as Date).getTime()) {
                return {
                    start: dt,
                    end: dt
                };
            } else if (dt > timeExtent.end!) {
                if (direction === TimeSearchDirection.Forward) {
                    return undefined;
                } else {
                    return {
                        start: timeExtent.end as Date,
                        end: timeExtent.end as Date
                    };
                }
            } else if (dt < timeExtent.start) {
                if (direction === TimeSearchDirection.Backward) {
                    return undefined;
                } else {
                    return {
                        start: timeExtent.start as Date,
                        end: timeExtent.start as Date
                    };
                }
            } else {
                const isDefaultRequest = filters === undefined;
                if (direction) {
                    let nearestItem = isDefaultRequest ? this.getNearestItemFromCache_(timeExtent, dt, direction) : undefined;
                    if (!nearestItem) {
                        nearestItem = this.getNearestItemFromCatalogue_(dt, direction, filters);
                    }
                    return nearestItem;
                } else {
                    return Promise.all([
                        Promise.resolve(this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Backward)).then((item) => {
                            if (!item) {
                                return this.getNearestItemFromCatalogue_(dt, TimeSearchDirection.Backward, filters);
                            } else {
                                return item;
                            }
                        }),
                        Promise.resolve(this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Forward)).then((item) => {
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

    protected addCachedItems_(items) {
        if (items.length) {
            const maxDate = items[items.length - 1].start;

            const idx = this.cswCache_.data.findIndex((item) => item.start >= maxDate);
            if (idx !== -1) {
                this.cswCache_.data.splice(idx, 0, ...items);
            } else {
                this.cswCache_.data.push(...items);
            }
        }
    }

    protected getNearestItemFromCache_(timeExtent, dt: Date, direction: TimeSearchDirection) {
        if (direction === TimeSearchDirection.Forward) {
            const nearestItem = this.cswCache_.data.find((item) => item.start >= dt);
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

    protected getNearestItemFromCatalogue_(dt: Date, direction: TimeSearchDirection, requestFilters?: TimeDomainProviderFilters | null) {
        const productCatalogue = this.config_.productCatalogue;

        if (!productCatalogue) {
            return undefined;
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
                const cachedItem = this.cswCache_.data.find((cachedItem) => item.start.getTime() === cachedItem.start.getTime());
                if (!cachedItem) {
                    this.addCachedItems_([item]);
                }
                if (direction === TimeSearchDirection.Forward) {
                    this.cswCache_.intervals.addInterval(new TimeInterval(dt, item.start));
                } else {
                    this.cswCache_.intervals.addInterval(new TimeInterval(item.start, dt));
                }
            }
            return item
                ? {
                      start: item.start as Date,
                      end: item.start as Date
                  }
                : undefined;
        });
    }

    protected async getRecordsForInterval_(interval, requestFilters?: TimeDomainProviderFilters | null, maxItems?: number) {
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

        const data: ProductSearchRecord[] = [];

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
                    data.push(...response.results);
                    return response;
                });
        };

        let response;
        do {
            response = await retrievePage();
            if (maxItems && response.total > maxItems) {
                return [
                    {
                        start: interval.start.toDate(),
                        end: interval.end.toDate(),
                        metadata: {
                            isAggregated: true
                        }
                    }
                ];
            }
            page++;
        } while (response.total > page * pageSize);

        if (productCatalogue.timeSortParam) {
            data.sort((p1, p2) => p1.start.getTime() - p2.start.getTime());
        }

        let lastDate: Date;

        return data.filter((item) => {
            const keep = item.start.getTime() !== lastDate?.getTime();
            lastDate = item.start;
            return keep;
        });
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
        if (domainFilters?.variable) {
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
            } else {
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
