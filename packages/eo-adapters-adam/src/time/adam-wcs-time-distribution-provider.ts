import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance, SortOrder, QueryParams, TimeInterval, TimeIntervalSet } from '@oida/core';
import { DatasetTimeDistributionProvider, TimeSearchDirection, TimeDistributionRangeItem, DatasetProductSearchProvider } from '@oida/eo-mobx';


export type AdamWcsTimeDistributionProviderConfig = {
    serviceUrl: string;
    coverageId: string;
    axiosInstance?: AxiosInstanceWithCancellation;
    searchProvider?: DatasetProductSearchProvider;
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

            let params = {
                service: 'WCS',
                request: 'DescribeCoverage',
                version: '2.0.0',
                coverageId: this.config_.coverageId
            };

            this.timeExtent_ = this.axiosInstance_.request({
                url: this.config_.serviceUrl,
                params: params
            }).then((response) => {
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
                    if (size <= 2 || !this.config_.searchProvider) {
                        return [timeExtent];
                    } else {

                        let overlapStart = timeRange.start > timeExtent.start ? timeRange.start : timeExtent.start;
                        let overlapEnd = timeRange.end < timeExtent.end! ? timeRange.end : timeExtent.end;

                        let overlapSpan = overlapEnd.getTime() - overlapStart.getTime();
                        let extentSpan = (timeExtent.end as Date).getTime() - (timeExtent.start as Date).getTime();

                        size = size * (overlapSpan / extentSpan); // assuming uniform distribution
                        if ((overlapSpan / size) > resolution) {

                            let missingIntervals = this.cswCache_.intervals.addInterval(new TimeInterval(overlapStart, overlapEnd));

                            if (!missingIntervals.length) {
                                return this.cswCache_.data.filter(item => item.start >= overlapStart && item.start <= overlapEnd);
                            } else {
                                let requests = missingIntervals.map((interval) => {
                                    return this.getRecordsForInterval_(interval)
                                    .then((records) => {
                                        let items = records.map((item) => {
                                            return {
                                                start: item.start as Date,
                                                end: item.start as Date
                                            };
                                        });
                                        this.addCachedItems_(items);
                                    }).catch((error) => {
                                        this.cswCache_.intervals.removeInterval(interval);
                                    });
                                });

                                return Promise.all(requests).then(() => {
                                    return this.cswCache_.data.filter(item => item.start >= overlapStart && item.start <= overlapEnd);
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

    getNearestItem(dt: Date, direction: TimeSearchDirection) {
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
                let nearestItem = this.getNearestItemFromCache_(timeExtent, dt, direction);
                if (!nearestItem) {
                    nearestItem = this.getNearestItemFromCatalogue_(dt, direction);
                }
                return nearestItem;
            }

        });

    }

    protected parseDescribeCoverageResponse_(response) {

        try {
            let doc = this.domParser.parseFromString(response, 'application/xml');

            let coverageDescription = doc.getElementsByTagNameNS(this.xmlNamespaces.wcs, 'CoverageDescription')[0];

            let envelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces.gml, 'Envelope')[0];
            let axes = envelope.getAttribute('axisLabels');
            let timeAxisIdx = axes!.split(' ').indexOf('t');

            let lowerCorner = envelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'lowerCorner')[0];
            let minTime = parseInt(lowerCorner.childNodes[0].nodeValue!.split(' ')[timeAxisIdx]);

            let upperCorner = envelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'upperCorner')[0];
            let maxTime = parseInt(upperCorner.childNodes[0].nodeValue!.split(' ')[timeAxisIdx]);

            let size = 1;

            if (maxTime !== minTime) {
                let gridEnvelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces.gml, 'GridEnvelope')[0];
                let highValue = gridEnvelope.getElementsByTagNameNS(this.xmlNamespaces.gml, 'high')[0].textContent;
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
            let maxDate = items[items.length - 1].start;

            let idx = this.cswCache_.data.findIndex(item => item.start > maxDate);
            if (idx !== -1) {
                this.cswCache_.data.splice(idx, 0, ...items);
            } else {
                this.cswCache_.data.push(...items);
            }
        }
    }

    protected getNearestItemFromCache_(timeExtent, dt: Date, direction: TimeSearchDirection) {
        let cachedIntervals = this.cswCache_.intervals.getIntervals();
        if (cachedIntervals.length && cachedIntervals[0].start.isSame(timeExtent.start)
            && cachedIntervals[0].end.isSame(timeExtent.end)
        ) {
            if (direction === TimeSearchDirection.Forward) {
                return this.cswCache_.data.find(item => item.start >= dt);
            } else {
                return this.cswCache_.data.slice().reverse().find(item => item.start <= dt);
            }
        }
    }

    protected getNearestItemFromCatalogue_(dt: Date, direction: TimeSearchDirection) {

        const searchProvider = this.config_.searchProvider;
        if (!searchProvider) {
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
                filters: [{
                    key: 'time',
                    value: {
                        start: dt
                    },
                    type: 'daterange'
                }],
                sortBy: {
                    key: 'dc:date',
                    order: SortOrder.Ascending
                }
            };
        } else {
            params = {
                paging: {
                    page: 0,
                    offset: 0,
                    pageSize: 1
                },
                filters: [{
                    key: 'time',
                    value: {
                        end: moment(dt).add({'seconds': 1}).toDate()
                    },
                    type: 'daterange'
                }],
                sortBy: {
                    key: 'dc:date',
                    order: SortOrder.Descending
                }
            };
        }

        return searchProvider.searchProducts(params).then((response) => {
            let item = response.results[0];
            return item ? {
                start: item.start as Date,
                end: item.start as Date
            } : undefined;
        });
    }

    protected async getRecordsForInterval_(interval) {
        const pageSize = 10;
        let page = 0;

        const filters = [{
            key: 'time',
            value: {
                start: interval.start.toDate(),
                end: interval.end.add({'seconds': 1}).toDate()
            },
            type: 'daterange'
        }];

        const sortBy = {
            key: 'dc:date',
            order: SortOrder.Ascending
        };

        const data: any[] = [];

        const retrievePage = () => {
            return this.config_.searchProvider!.searchProducts({
                paging: {
                    page: page,
                    offset: page * pageSize,
                    pageSize: pageSize
                },
                filters: filters,
                sortBy: sortBy
            }).then((response) => {
                data.push(...response.results);
                return response;
            });
        };

        let response;
        do {
            response = await retrievePage();
            page++;
        } while (response.total > page * pageSize);

        return data;
    }
}
