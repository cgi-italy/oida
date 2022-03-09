import {
    DatasetTimeDistributionProvider,
    TimeSearchDirection,
    TimeDistributionInstantItem,
    TimeDomainProviderFilters
} from '@oidajs/eo-mobx';

export type VideoTimeDistributionProviderConfig = {
    timeRange: {
        start: Date;
        end: Date;
    };
    frameRate?: number;
};

export class VideoTimeDistributionProvider implements DatasetTimeDistributionProvider {
    protected readonly timeRange_: { start: Date; end: Date };
    protected readonly frameDuration_: number | undefined;

    constructor(config: VideoTimeDistributionProviderConfig) {
        this.timeRange_ = config.timeRange;
        this.frameDuration_ = config.frameRate ? 1000 / config.frameRate : undefined;
    }

    supportsHistograms() {
        return true;
    }

    setDefaultFilters(filters: TimeDomainProviderFilters | null): boolean {
        return false;
    }

    getTimeExtent() {
        return Promise.resolve(this.timeRange_);
    }

    getTimeDistribution(timeRange, filters, resolution?) {
        if (timeRange.start > this.timeRange_.end) {
            return Promise.resolve([]);
        } else if (timeRange.end < this.timeRange_.start) {
            return Promise.resolve([]);
        } else {
            if (this.frameDuration_ && resolution < this.frameDuration_) {
                const distance = timeRange.start.getTime() - this.timeRange_.start.getTime();
                let frame =
                    distance > 0
                        ? this.timeRange_.start.getTime() + this.frameDuration_ * Math.floor(distance / this.frameDuration_)
                        : this.timeRange_.start.getTime();
                const end = this.timeRange_.end < timeRange.end ? this.timeRange_.end.getTime() : timeRange.end.getTime();
                const distributionItems: TimeDistributionInstantItem[] = [];
                while (frame <= end) {
                    distributionItems.push({ start: new Date(frame) });
                    frame += this.frameDuration_;
                }
                return Promise.resolve(distributionItems);
            } else {
                return Promise.resolve([
                    {
                        start: new Date(this.timeRange_.start),
                        end: new Date(this.timeRange_.end)
                    }
                ]);
            }
        }
    }

    getNearestItem(dt: Date, direction?: TimeSearchDirection) {
        let target: Date | undefined;
        if (direction === TimeSearchDirection.Forward) {
            target = this.getNextItem_(dt);
        } else if (direction === TimeSearchDirection.Backward) {
            target = this.getPrevItem_(dt);
        } else {
            const next = this.getNextItem_(dt);
            const prev = this.getPrevItem_(dt);
            if (!next) {
                target = prev;
            } else if (!prev) {
                target = next;
            } else {
                const nextDistance = next.getTime() - dt.getTime();
                const prevDistance = dt.getTime() - prev.getTime();
                target = nextDistance < prevDistance ? next : prev;
            }
        }
        return Promise.resolve(target ? { start: new Date(target) } : undefined);
    }

    protected getNextItem_(dt: Date) {
        let target: Date | undefined;
        if (dt > this.timeRange_.end) {
            target = undefined;
        } else if (dt < this.timeRange_.start) {
            target = this.timeRange_.start;
        } else if (this.frameDuration_) {
            const distance = dt.getTime() - this.timeRange_.start.getTime();
            target = new Date(this.timeRange_.start.getTime() + this.frameDuration_ * Math.ceil(distance / this.frameDuration_));
        } else {
            target = dt;
        }
        return target;
    }

    protected getPrevItem_(dt: Date) {
        let target: Date | undefined;
        if (dt < this.timeRange_.start) {
            target = undefined;
        } else if (dt > this.timeRange_.end) {
            target = this.timeRange_.end;
        } else if (this.frameDuration_) {
            const distance = dt.getTime() + 1 - this.timeRange_.start.getTime();
            target = new Date(this.timeRange_.start.getTime() + this.frameDuration_ * Math.floor(distance / this.frameDuration_));
        } else {
            target = dt;
        }
        return target;
    }
}
