import { types, flow, Instance } from 'mobx-state-tree';
import { easeOut } from 'ol/easing';

const TimeRangeDecl = types.model(
    'TimeRange',
    {
        start: types.Date,
        end: types.Date,
        resolution: types.maybe(types.number)
    }
).actions((self) => {

    let nextFrame: number | undefined;

    let animatRange = flow(function* animateRange(nextStart: Date, nextEnd: Date) {

        let duration = 1000;
        let elapsed = 0;

        let prevStart = self.start.getTime();
        let startOffset = nextStart.getTime() - prevStart;
        let prevEnd = self.end.getTime();
        let endOffset = nextEnd.getTime() - prevEnd;

        let lastFrameTS = performance.now();

        while (elapsed < duration) {
            let targetRange = yield new Promise((resolve, reject) => {
                nextFrame = requestAnimationFrame((frameTS) => {
                    elapsed += frameTS - lastFrameTS;
                    lastFrameTS = frameTS;
                    return resolve({
                        start: new Date(prevStart + easeOut(elapsed / duration) * startOffset),
                        end: new Date(prevEnd + easeOut(elapsed / duration) * endOffset)
                    });
                });
            });

            self.start = targetRange.start;
            self.end = targetRange.end;
        }

        self.start = nextStart;
        self.end = nextEnd;
        nextFrame = undefined;
    });

    return {
        setRange: (start: Date, end: Date, animate?: boolean) => {

            if (start.getTime() > end.getTime()) {
                return;
            }

            if (start.getTime() === end.getTime()) {
                // @ts-ignore
                self.setDate(start, animate);
                return;
            }

            if (nextFrame) {
                cancelAnimationFrame(nextFrame);
                nextFrame = undefined;
            }

            if (!animate) {
                self.start = start;
                self.end = end;
            } else {
                animatRange(start, end);
            }
        },
        setResolution: (resolution) => {
            self.resolution = resolution;
        },
        makeRangeVisible: (start: Date, end: Date, marginRatio: number, animate: boolean) => {
            if (start.getTime() < self.start.getTime() || end.getTime() > self.end.getTime()) {
                let rangeSize = end.getTime() - start.getTime();
                let timeMargin = rangeSize * marginRatio;
                (self as any).setRange(new Date(start.getTime() - timeMargin),  new Date(end.getTime() + timeMargin), animate);
            }
        },
        setDate: (dt: Date, animate?: boolean) => {
            let halfRangeSize = (self.end.getTime() - self.start.getTime()) / 2;
            (self as any).setRange(new Date(dt.getTime() - halfRangeSize), new Date(dt.getTime() + halfRangeSize), animate);
        }
    };
}).views((self) => {
    return {
        get date() {
            return new Date((self.end.getTime() + self.start.getTime() + 1) / 2);
        },
        get range() {
            return {
                start: self.start,
                end: self.end
            };
        }
    };
});


type TimeRangeType = typeof TimeRangeDecl;
export interface TimeRangeInterface extends TimeRangeType {}
export const TimeRange: TimeRangeInterface = TimeRangeDecl;
export interface ITimeRange extends Instance<TimeRangeInterface> {}
