import moment from 'moment';

import { DatasetTimeDistributionProvider, STimeDistributionItem } from '../dataset-time-distribution-provider';

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
    protected timeExtent_: STimeDistributionItem | undefined;

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

    getTimeExtent(filters) {

        if (!filters && this.timeExtent_) {
            return Promise.resolve(this.timeExtent_);
        } else {
            return this.wmtsService_.describeDomains({
                url: this.serviceUrl_,
                layer: this.layer_,
                tileMatrix: this.tileMatrix_,
                domains: 'time',
                expandLimit: 1,
                ...this.filterSerializer_(filters)
            }).then((response) => {
                let domains = response.domains;
                if (!domains) {
                    return null;
                }

                let timeDomain = domains.find((domain) => {
                    return domain.dimension.toLowerCase() === 'time';
                });

                if (!timeDomain || !timeDomain.range) {
                    return null;
                }

                let timeExtent = this.parseISOTimeRange_(timeDomain.range);
                if (!filters) {
                    this.timeExtent_ = {
                        start: timeExtent.start.toDate(),
                        end: timeExtent.end.toDate()
                    };
                }

                return {
                    start: timeExtent.start.toDate(),
                    end: timeExtent.end.toDate()
                };
            });
        }
    }

    getTimeDistribution(timeRange, filters, stepDuration?) {

        let isoPeriod = `${timeRange.start.toISOString()}/${timeRange.end.toISOString()}`;

        let resolution;
        if (stepDuration) {
            resolution = moment.duration(stepDuration).toISOString();
        }

        return this.wmtsService_.getHistogram({
            url: this.serviceUrl_,
            layer: this.layer_,
            tileMatrix: this.tileMatrix_,
            dimension: 'time',
            resolution: resolution,
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
