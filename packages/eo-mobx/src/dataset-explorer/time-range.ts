import { easeOut } from 'ol/easing';
import { observable, makeObservable, computed, runInAction, action } from 'mobx';
//TODO: remove dependency from ol

export type TimeRangeCenteringOptions = {
    animate?: boolean;
    margin?: number;
    notIfVisible?: boolean;
};

export type TimeRangeProps = {
    start: Date;
    end: Date;
    resolution?: number;
};

export class TimeRange {
    @observable.ref start: Date;
    @observable.ref end: Date;
    @observable.ref resolution: number | undefined;

    protected nextRangeAnimationFrame_: number | undefined;

    constructor(props: TimeRangeProps) {
        this.start = props.start;
        this.end = props.end;
        this.resolution = props.resolution;

        makeObservable(this);
    }

    @computed
    get date() {
        return new Date(Math.round((this.end.getTime() + this.start.getTime()) / 2));
    }

    @computed
    get value() {
        return {
            start: this.start,
            end: this.end
        };
    }

    @action
    setValue(start: Date, end: Date, animate?: boolean) {

        if (start.getTime() > end.getTime()) {
            return;
        }

        if (start.getTime() === end.getTime()) {
            this.centerDate(start, {
                animate: animate
            });
            return;
        }

        if (this.nextRangeAnimationFrame_) {
            cancelAnimationFrame(this.nextRangeAnimationFrame_);
            this.nextRangeAnimationFrame_ = undefined;
        }

        if (!animate) {
            this.start = start;
            this.end = end;
        } else {
            this.animateRange_(start, end);
        }
    }

    @action
    setResolution(resolution) {
        this.resolution = resolution;
    }

    @action
    centerRange(start: Date, end: Date, options?: TimeRangeCenteringOptions) {
        if (options?.notIfVisible) {
            if (start.getTime() >= this.start.getTime() && end.getTime() <= this.end.getTime()) {
                return;
            }
        }
        let rangeSize = end.getTime() - start.getTime();
        let timeMargin = rangeSize * (options?.margin !== undefined ? options.margin : 0.2);
        this.setValue(new Date(start.getTime() - timeMargin),  new Date(end.getTime() + timeMargin), options?.animate);
    }

    @action
    centerDate(dt: Date, options?: TimeRangeCenteringOptions) {
        if (options?.notIfVisible && dt >= this.start && dt <= this.end) {
            return;
        }
        let halfRangeSize = (this.end.getTime() - this.start.getTime()) / 2;
        this.setValue(new Date(dt.getTime() - halfRangeSize), new Date(dt.getTime() + halfRangeSize), options?.animate);
    }

    protected animateRange_(nextStart: Date, nextEnd: Date) {

        let duration = 1000;
        let elapsed = 0;

        let prevStart = this.start.getTime();
        let startOffset = nextStart.getTime() - prevStart;
        let prevEnd = this.end.getTime();
        let endOffset = nextEnd.getTime() - prevEnd;

        let lastFrameTS = performance.now();

        const updateRange = (frameTS) => {
            elapsed += frameTS - lastFrameTS;
            lastFrameTS = frameTS;

            if (elapsed < duration) {
                runInAction(() => {
                    this.start =  new Date(prevStart + easeOut(elapsed / duration) * startOffset);
                    this.end = new Date(prevEnd + easeOut(elapsed / duration) * endOffset);
                });
                this.nextRangeAnimationFrame_ = requestAnimationFrame(updateRange);
            } else {
                runInAction(() => {
                    this.start = nextStart;
                    this.end = nextEnd;
                });
                this.nextRangeAnimationFrame_ = undefined;
            }
        };

        updateRange(lastFrameTS);

    }
}
