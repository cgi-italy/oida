import moment from 'moment';

import { DatasetTimeDistributionProvider, TimeDistributionRangeItem } from '../dataset-time-distribution-provider';

import { WmtsDomainDiscoveryService } from '../../../standards';


type FilterSerializer = (filters) => undefined | {[key: string]: string};

export type WmtsTimeDistributionProviderConfig = {
    serviceUrl: string;
    layer: string;
    tileMatrix: string;
    filterSerializer: FilterSerializer;
    wmtsService?: WmtsDomainDiscoveryService;
};

export class WmtsTimeDistributionProvider implements DatasetTimeDistributionProvider {

    protected serviceUrl_: string;
    protected layer_: string;
    protected tileMatrix_: string;
    protected filterSerializer_: FilterSerializer;
    protected wmtsService_: WmtsDomainDiscoveryService;
    protected timeExtent_: Promise<TimeDistributionRangeItem | undefined> | undefined;

    constructor(config: WmtsTimeDistributionProviderConfig) {
        this.serviceUrl_ = config.serviceUrl;
        this.layer_ = config.layer;
        this.tileMatrix_ = config.tileMatrix;
        this.filterSerializer_ = config.filterSerializer;
        this.wmtsService_ = config.wmtsService || new WmtsDomainDiscoveryService({});
    }

    supportsHistograms() {
        return true;
    }

    getTimeExtent(filters?) {

        if (!filters && this.timeExtent_) {
            return this.timeExtent_;
        } else {
            let request = this.wmtsService_.describeDomains({
                url: this.serviceUrl_,
                layer: this.layer_,
                tileMatrix: this.tileMatrix_,
                domains: 'time',
                expandLimit: 1,
                ...this.filterSerializer_(filters)
            }).then((response) => {
                let domains = response.domains;
                if (!domains) {
                    return undefined;
                }

                let timeDomain = domains.find((domain) => {
                    return domain.dimension.toLowerCase() === 'time';
                });

                if (!timeDomain || !timeDomain.range) {
                    return undefined;
                }

                let timeExtent = this.parseISOTimeRange_(timeDomain.range);

                return {
                    start: timeExtent.start.toDate() as Date,
                    end: timeExtent.end.toDate() as Date
                };
            });

            if (!filters) {
                this.timeExtent_ = request;
            }
            return request;
        }
    }

    getTimeDistribution(timeRange, filters, resolution?) {

        let isoPeriod = `${timeRange.start.toISOString()}/${timeRange.end.toISOString()}`;

        let resParam;
        if (resolution) {
            resParam = moment.duration(resolution).toISOString();
        }

        return this.wmtsService_.getHistogram({
            url: this.serviceUrl_,
            layer: this.layer_,
            tileMatrix: this.tileMatrix_,
            dimension: 'time',
            resolution: resParam,
            restrictions: [{dimension: 'time', range: isoPeriod}],
            ...this.filterSerializer_(filters)
        }).then((response) => {

            let items: any = [];

            if (response.range) {

                let range = this.parseISOTimeRange_(response.range);

                let rangeStart = moment(range.start);
                let rangeEnd = moment(range.start);

                response.values.forEach((val) => {
                    if (!val) {
                        if (!rangeStart.isSame(rangeEnd)) {
                            items.push({
                                start: rangeStart.toDate(),
                                end: rangeEnd.toDate()
                            });
                        }
                        rangeStart = moment(rangeEnd).add(range.step);
                    }
                    rangeEnd.add(range.step);
                });

                if (!rangeStart.isSame(rangeEnd)) {
                    items.push({
                        start: rangeStart.toDate(),
                        end: rangeEnd.toDate()
                    });
                }
            }

            return items;
        });
    }

    getNearestItem(dt: Date, direction) {
        // TODO: implement this
        return Promise.resolve(undefined);
    }

    private parseISOTimeRange_(timeRange: string) {
        let range: any = null;

        if (timeRange.search('--') !== -1) {
            let startEnd = timeRange.split('--');
            range = {
                start: moment.utc(startEnd[0]),
                end: moment.utc(startEnd[1])
            };
        } else if (timeRange.search(',') !== -1) {
            let values = timeRange.split(',');
            range = {
                start: moment.utc(values[0]),
                end: moment.utc(values[values.length - 1])
            };
        } else if (timeRange.search('/') !== - 1) {
            let startEndStep = timeRange.split('/');
            range = {
                start: moment.utc(startEndStep[0]),
                end: moment.utc(startEndStep[1]),
                step: moment.duration(startEndStep[2])
            };
        } else {
            range = {
                start: moment.utc(timeRange),
                end: moment.utc(timeRange)
            };
        }

        return range;
    }
}
