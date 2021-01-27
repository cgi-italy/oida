import { DatasetTimeDistributionProvider, TimeSearchDirection, TimeDistributionInstantItem } from '@oida/eo-mobx';

export type VideoTimeDistributionProviderConfig = {
    timeRange: {
        start: Date,
        end: Date
    },
    frameRate?: number;
};

export class VideoTimeDistributionProvider implements DatasetTimeDistributionProvider {

    protected readonly timeRange_: {start: Date, end: Date};
    protected readonly frameRateInMsec_: number | undefined;

    constructor(config: VideoTimeDistributionProviderConfig) {
        this.timeRange_ = config.timeRange;
        this.frameRateInMsec_ = config.frameRate ? config.frameRate * 1000 : undefined;
    }

    supportsHistograms() {
        return true;
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
            if (this.frameRateInMsec_ && resolution < this.frameRateInMsec_) {
                const distance = timeRange.start.getTime() - this.timeRange_.start.getTime();
                let frame = this.timeRange_.start.getTime() + Math.floor(distance / this.frameRateInMsec_);
                const end = this.timeRange_.end < timeRange.end ? this.timeRange_.end.getTime() : timeRange.end.getTime();
                const distributionItems: TimeDistributionInstantItem[] = [];
                while (frame < end) {
                    distributionItems.push({start: new Date(frame)});
                    frame += this.frameRateInMsec_;
                }
                return Promise.resolve(distributionItems);
            } else {
                return Promise.resolve([{
                    start: this.timeRange_.start,
                    end: this.timeRange_.end
                }]);
            }
        }
    }

    getNearestItem(dt: Date, direction: TimeSearchDirection) {
        let target: Date | undefined;
        if (direction === TimeSearchDirection.Forward) {
            if (dt > this.timeRange_.end) {
                target = undefined;
            } else if (dt < this.timeRange_.start) {
                target = this.timeRange_.start;
            } else if (this.frameRateInMsec_) {
                const distance = dt.getTime() - this.timeRange_.start.getTime();
                target = new Date(this.timeRange_.start.getTime() + Math.ceil(distance / this.frameRateInMsec_));
            } else {
                target = dt;
            }
        } else {
            if (dt < this.timeRange_.start) {
                target = undefined;
            } else if (dt > this.timeRange_.end) {
                target = this.timeRange_.end;
            } else if (this.frameRateInMsec_) {
                const distance = dt.getTime() - this.timeRange_.start.getTime();
                target = new Date(this.timeRange_.start.getTime() + Math.floor(distance / this.frameRateInMsec_));
            } else {
                target = dt;
            }
        }
        return Promise.resolve(target ? {start: target} : undefined);
    }
}

