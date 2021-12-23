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
    QueryFilter
} from '@oidajs/core';
import {
    DatasetTimeDistributionProvider,
    TimeSearchDirection,
    TimeDistributionRangeItem,
    DatasetProductSearchProvider,
    ProductSearchRecord,
    DataDomainProviderFilters
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
};

export class AdamWcsTimeDistributionProvider implements DatasetTimeDistributionProvider {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected config_: AdamWcsTimeDistributionProviderConfig;
    protected timeExtent_: Promise<TimeDistributionRangeItem> | undefined;
    protected cswCache_ = {
        intervals: new TimeIntervalSet(),
        data: [] as any[]
    };

    private domParser = new DOMParser();
    private xmlNamespaces = {
        ows: 'http://www.opengis.net/ows/1.1',
        gml: 'http://www.opengis.net/gml/3.2',
        wcs: 'http://www.opengis.net/wcs/2.0'
    };

    constructor(config: AdamWcsTimeDistributionProviderConfig) {
        this.config_ = config;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
    }

    getTimeExtent(filters?) {
        if (!this.timeExtent_) {
            const params = {
                service: 'WCS',
                request: 'DescribeCoverage',
                version: '2.0.0',
                coverageId: this.config_.coverageId
            };

            this.timeExtent_ = this.axiosInstance_
                .request({
                    url: this.config_.serviceUrl,
                    params: params
                })
                .then((response) => {
                    return this.parseDescribeCoverageResponse_(response.data);
                });
        }

        return this.timeExtent_ as Promise<TimeDistributionRangeItem>;
    }

    supportsHistograms() {
        return false;
    }

    getTimeDistribution(timeRange, filters, resolution) {
        return this.getTimeExtent().then((timeExtent) => {
            if (timeExtent) {
                if (timeRange.end < timeExtent.start || timeRange.start > timeExtent.end!) {
                    return [];
                } else {
                    let size = timeExtent.data?.size || 1;
                    if (!this.config_.productCatalogue) {
                        return [timeExtent];
                    } else {
                        const overlapStart = timeRange.start > timeExtent.start ? timeRange.start : timeExtent.start;
                        const overlapEnd = timeRange.end < timeExtent.end! ? timeRange.end : timeExtent.end;

                        const overlapSpan = overlapEnd.getTime() - overlapStart.getTime();
                        const extentSpan = (timeExtent.end as Date).getTime() - (timeExtent.start as Date).getTime();

                        size = size * (overlapSpan / extentSpan); // assuming uniform distribution
                        if (overlapSpan / size > resolution) {
                            const missingIntervals = this.cswCache_.intervals.addInterval(new TimeInterval(overlapStart, overlapEnd));

                            if (!missingIntervals.length) {
                                return this.cswCache_.data.filter((item) => item.start >= overlapStart && item.start <= overlapEnd);
                            } else {
                                const requests = missingIntervals.map((interval) => {
                                    return this.getRecordsForInterval_(interval, filters)
                                        .then((records) => {
                                            const items = records.map((item) => {
                                                return {
                                                    start: item.start as Date,
                                                    end: item.start as Date
                                                };
                                            });
                                            this.addCachedItems_(items);
                                        })
                                        .catch((error) => {
                                            this.cswCache_.intervals.removeInterval(interval);
                                        });
                                });

                                return Promise.all(requests).then(() => {
                                    return this.cswCache_.data.filter((item) => item.start >= overlapStart && item.start <= overlapEnd);
                                });
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

    getNearestItem(dt: Date, direction?: TimeSearchDirection, filters?) {
        return this.getTimeExtent().then((timeExtent) => {
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
                if (direction) {
                    let nearestItem = this.getNearestItemFromCache_(timeExtent, dt, direction);
                    if (!nearestItem) {
                        nearestItem = this.getNearestItemFromCatalogue_(dt, direction);
                    }
                    return nearestItem;
                } else {
                    return Promise.all([
                        Promise.resolve(this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Backward)).then((item) => {
                            if (!item) {
                                return this.getNearestItemFromCatalogue_(dt, TimeSearchDirection.Backward);
                            } else {
                                return item;
                            }
                        }),
                        Promise.resolve(this.getNearestItemFromCache_(timeExtent, dt, TimeSearchDirection.Forward)).then((item) => {
                            if (!item) {
                                return this.getNearestItemFromCatalogue_(dt, TimeSearchDirection.Forward);
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

    protected parseDescribeCoverageResponse_(response) {
        try {
            const doc = this.domParser.parseFromString(response, 'application/xml');

            const coverageDescription = doc.getElementsByTagNameNS(this.xmlNamespaces.wcs, 'CoverageDescription')[0];

            const envelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces.gml, 'Envelope')[0];
            const axes = envelope.getAttribute('axisLabels');
            const timeAxisIdx = axes!.split(' ').indexOf('t');

            const lowerCorner = envelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'lowerCorner')[0];
            const minTime = parseInt(lowerCorner.childNodes[0].nodeValue!.split(' ')[timeAxisIdx]);

            const upperCorner = envelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'upperCorner')[0];
            const maxTime = parseInt(upperCorner.childNodes[0].nodeValue!.split(' ')[timeAxisIdx]);

            let size = 1;

            if (maxTime !== minTime) {
                const gridEnvelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces.gml, 'GridEnvelope')[0];
                const highValue = gridEnvelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'high')[0].textContent;
                size = parseInt(highValue!.split(' ')[timeAxisIdx]) + 1;
            }

            return {
                start: new Date(minTime * 1000),
                end: new Date(maxTime * 1000),
                data: {
                    size: size
                }
            };
        } catch (e) {
            throw new Error('AdamWcsTimeDistributionProvider: unable to parse describeCoverage response');
        }
    }

    protected addCachedItems_(items) {
        if (items.length) {
            const maxDate = items[items.length - 1].start;

            const idx = this.cswCache_.data.findIndex((item) => item.start > maxDate);
            if (idx !== -1) {
                this.cswCache_.data.splice(idx, 0, ...items);
            } else {
                this.cswCache_.data.push(...items);
            }
        }
    }

    protected getNearestItemFromCache_(timeExtent, dt: Date, direction: TimeSearchDirection) {
        const cachedIntervals = this.cswCache_.intervals.getIntervals();
        if (cachedIntervals.length && cachedIntervals[0].start.isSame(timeExtent.start) && cachedIntervals[0].end.isSame(timeExtent.end)) {
            if (direction === TimeSearchDirection.Forward) {
                return this.cswCache_.data.find((item) => item.start >= dt);
            } else {
                return this.cswCache_.data
                    .slice()
                    .reverse()
                    .find((item) => item.start <= dt);
            }
        }
    }

    protected getNearestItemFromCatalogue_(dt: Date, direction: TimeSearchDirection) {
        const productCatalogue = this.config_.productCatalogue;

        if (!productCatalogue) {
            return undefined;
        }

        let params: QueryParams;

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
                    }
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
                            end: moment(dt).add({ seconds: 1 }).toDate()
                        },
                        type: DATE_RANGE_FIELD_ID
                    }
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
            return item
                ? {
                      start: item.start as Date,
                      end: item.start as Date
                  }
                : undefined;
        });
    }

    protected async getRecordsForInterval_(interval, requestFilters?: DataDomainProviderFilters) {
        const productCatalogue = this.config_.productCatalogue;
        if (!productCatalogue) {
            throw new Error('No product catalogue configuration provided');
        }
        const pageSize = 200;
        let page = 0;

        const filters: QueryFilter[] = [
            {
                key: productCatalogue.timeRangeQueryParam,
                value: {
                    start: interval.start.toDate(),
                    end: interval.end.add({ seconds: 1 }).toDate()
                },
                type: DATE_RANGE_FIELD_ID
            }
        ];

        requestFilters?.dimensionValues?.forEach((value, key) => {
            if (key === 'subdataset') {
                filters.push({
                    key: 'subDatasetId',
                    value: value,
                    type: STRING_FIELD_ID
                });
            } else {
                filters.push({
                    key: key,
                    value: value,
                    type: STRING_FIELD_ID
                });
            }
        });

        if (requestFilters?.variable) {
            filters.push({
                key: 'subDatasetId',
                value: requestFilters.variable,
                type: STRING_FIELD_ID
            });
        }

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
}
