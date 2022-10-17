import moment from 'moment';

import {
    DatasetTimeDistributionProvider,
    TimeDistributionRangeItem,
    TimeDistributionInstantItem,
    TimeSearchDirection,
    TimeDomainProviderFilters
} from '@oidajs/eo-mobx';

export type WmsTimeDistributionItem =
    | Date
    | {
          start: Date;
          end: Date;
          step: number;
      };

export type WmsTimeDistributionProviderConfig = {
    timeDimension: string;
};

export class WmsTimeDistributionProvider implements DatasetTimeDistributionProvider {
    protected timeDistribution_: WmsTimeDistributionItem[];

    constructor(config: WmsTimeDistributionProviderConfig) {
        this.timeDistribution_ = [];
        this.parseWmsTimeRange_(config.timeDimension);
    }

    supportsHistograms() {
        return true;
    }

    setDefaultFilters(filters: TimeDomainProviderFilters | null): boolean {
        return false;
    }

    getTimeExtent() {
        const firstItem = this.timeDistribution_[0];
        const lastItem = this.timeDistribution_[this.timeDistribution_.length - 1];

        let start: Date, end: Date;
        if (firstItem instanceof Date) {
            start = new Date(firstItem);
        } else {
            start = firstItem.start;
        }
        if (lastItem instanceof Date) {
            end = new Date(lastItem);
        } else {
            end = lastItem.end;
        }

        return Promise.resolve({
            start,
            end
        });
    }

    getTimeDistribution(timeRange, filters, resolution?) {
        let currIndex = this.timeDistribution_.findIndex((item) => {
            if (item instanceof Date) {
                return item >= timeRange.start;
            } else {
                return item.end >= timeRange.start;
            }
        });
        if (currIndex === -1) {
            return Promise.resolve([]);
        }

        const distributionItems: (TimeDistributionRangeItem | TimeDistributionInstantItem)[] = [];
        let prevItem: TimeDistributionRangeItem | TimeDistributionInstantItem;

        const item = this.timeDistribution_[currIndex];
        if (item instanceof Date) {
            if (item > timeRange.end) {
                return Promise.resolve([]);
            }
            prevItem = {
                start: item
            };
        } else {
            if (item.step < resolution) {
                prevItem = {
                    start: item.start > timeRange.start ? item.start : timeRange.start,
                    end: item.end
                };
            } else {
                const start = timeRange.start > item.start ? timeRange.start : item.start;
                const startIndex = Math.floor((start.getTime() - item.start.getTime()) / item.step);
                const dt = new Date(item.start.getTime() + startIndex * item.step);
                const end = timeRange.end < item.end ? timeRange.end : item.end;
                while (dt < end) {
                    distributionItems.push({
                        start: new Date(dt)
                    });
                    dt.setTime(dt.getTime() + item.step);
                }
                prevItem = {
                    start: item.end
                };
            }
        }
        distributionItems.push(prevItem);

        currIndex++;
        while (currIndex < this.timeDistribution_.length) {
            const item = this.timeDistribution_[currIndex];
            const lastEnd = (prevItem as TimeDistributionRangeItem).end || prevItem.start;
            if (item instanceof Date) {
                if (item > timeRange.end) {
                    break;
                }
                const distance = item.getTime() - lastEnd.getTime();
                if (distance > resolution) {
                    prevItem = {
                        start: new Date(item)
                    };
                    distributionItems.push(prevItem);
                } else {
                    (prevItem as TimeDistributionRangeItem).end = new Date(item);
                }
            } else {
                if (item.start > timeRange.end) {
                    break;
                }
                if (item.step < resolution) {
                    const distance = item.start.getTime() - lastEnd.getTime();
                    if (distance > resolution) {
                        prevItem = {
                            start: new Date(item.start),
                            end: new Date(item.end)
                        };
                        distributionItems.push(prevItem);
                    } else {
                        (prevItem as TimeDistributionRangeItem).end = new Date(item.end);
                    }
                } else {
                    const dt = new Date(item.start);
                    const end = timeRange.end < item.end ? timeRange.end : item.end;
                    while (dt < end) {
                        distributionItems.push({
                            start: new Date(dt)
                        });
                        dt.setTime(dt.getTime() + item.step);
                    }
                    prevItem = {
                        start: item.end
                    };
                    distributionItems.push(prevItem);
                }
            }
            currIndex++;
        }

        return Promise.resolve(distributionItems);
    }

    getNearestItem(dt: Date, direction?: TimeSearchDirection) {
        if (direction === TimeSearchDirection.Forward) {
            return this.getNextItem_(dt);
        } else if (direction === TimeSearchDirection.Backward) {
            return this.getPrevItem_(dt);
        } else {
            return Promise.all([this.getPrevItem_(dt), this.getNextItem_(dt)]).then(([prev, next]) => {
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

    protected parseWmsTimeRange_(timeRange: string) {
        if (timeRange.search(',') !== -1) {
            const values = timeRange.split(',');
            values.forEach((value) => {
                if (value.search('/') !== -1) {
                    const startEndStep = value.split('/');
                    this.timeDistribution_.push({
                        start: moment.utc(startEndStep[0]).toDate(),
                        end: moment.utc(startEndStep[1]).toDate(),
                        step: moment.duration(startEndStep[2]).asMilliseconds()
                    });
                } else {
                    this.timeDistribution_.push(moment.utc(value).toDate());
                }
            });
        } else if (timeRange.search('/') !== -1) {
            const startEndStep = timeRange.split('/');
            this.timeDistribution_.push({
                start: moment.utc(startEndStep[0]).toDate(),
                end: moment.utc(startEndStep[1]).toDate(),
                step: moment.duration(startEndStep[2]).asMilliseconds()
            });
        } else {
            this.timeDistribution_.push(moment.utc(timeRange).toDate());
        }
    }

    protected getNextItem_(dt: Date) {
        const target = this.timeDistribution_.find((item) => {
            if (item instanceof Date) {
                return item >= dt;
            } else {
                return item.end >= dt;
            }
        });
        if (!target) {
            return Promise.resolve(undefined);
        }
        if (target instanceof Date) {
            return Promise.resolve({
                start: target
            });
        } else {
            const distance = dt.getTime() - target.start.getTime();
            if (distance <= 0) {
                return Promise.resolve({
                    start: target.start
                });
            } else {
                if (target.step <= 0) {
                    return Promise.resolve({
                        start: dt
                    });
                } else {
                    const numSteps = Math.ceil(distance / target.step);
                    return Promise.resolve({
                        start: new Date(target.start.getTime() + numSteps * target.step)
                    });
                }
            }
        }
    }

    protected getPrevItem_(dt: Date) {
        const target = this.timeDistribution_
            .slice()
            .reverse()
            .find((item) => {
                if (item instanceof Date) {
                    return item <= dt;
                } else {
                    return item.start <= dt;
                }
            });
        if (!target) {
            return Promise.resolve(undefined);
        }
        if (target instanceof Date) {
            return Promise.resolve({
                start: target
            });
        } else {
            const distance = target.end.getTime() - dt.getTime();
            if (distance <= 0) {
                return Promise.resolve({
                    start: target.end
                });
            } else {
                if (target.step <= 0) {
                    return Promise.resolve({
                        start: dt
                    });
                } else {
                    const numSteps = Math.ceil(distance / target.step);
                    return Promise.resolve({
                        start: new Date(target.end.getTime() - numSteps * target.step)
                    });
                }
            }
        }
    }
}
