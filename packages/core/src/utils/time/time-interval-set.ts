import { TimeInterval } from './time-interval';

/**
 * A class to manage a set of non overlapping sorted time intervals.
 * It automatically merges overlapping intervals on add and splits
 * existing intervals on removal
 */
export class TimeIntervalSet {
    private intervals_: TimeInterval[] = [];

    /**
     * Add an interval to the set. If the interval overlaps with
     * any of the existing intervals they will be merged together
     * @param interval The time interval to add
     * @returns The array of intervals that were added (computed based
     * on the difference between the new interval and the current set)
     */
    addInterval(interval: TimeInterval): TimeInterval[] {
        const insertionData = this.getOverlappingData(interval);

        if (insertionData.overlapStart === -1) {
            this.intervals_.splice(insertionData.prevIdx + 1, 0, new TimeInterval(interval.start, interval.end));
            return [new TimeInterval(interval.start, interval.end)];
        } else {
            const difference: TimeInterval[] = [];
            const mergeInterval = this.intervals_[insertionData.overlapStart];
            if (interval.start.isBefore(mergeInterval.start)) {
                difference.push(new TimeInterval(interval.start, mergeInterval.start));
                mergeInterval.setStart(interval.start);
            }
            for (let idx = insertionData.overlapStart; idx < insertionData.overlapEnd; ++idx) {
                difference.push(new TimeInterval(this.intervals_[idx].end, this.intervals_[idx + 1].start));
            }
            const endInterval = this.intervals_[insertionData.overlapEnd];
            if (interval.end.isAfter(endInterval.end)) {
                difference.push(new TimeInterval(endInterval.end, interval.end));
                mergeInterval.setEnd(interval.end);
            } else {
                mergeInterval.setEnd(endInterval.end);
            }

            this.intervals_.splice(insertionData.overlapStart + 1, insertionData.overlapEnd - insertionData.overlapStart);

            return difference;
        }
    }

    /**
     * Remove a time interval
     * @param interval The interval to remove
     */
    removeInterval(interval) {
        const overlapData = this.getOverlappingData(interval);
        if (overlapData.overlapStart !== -1) {
            const firstInterval = this.intervals_[overlapData.overlapStart];

            let deleteStart = overlapData.overlapStart;
            let deleteEnd = overlapData.overlapEnd;

            if (firstInterval.start.isBefore(interval.start)) {
                firstInterval.setEnd(interval.start);
                if (firstInterval.end.isAfter(interval.end)) {
                    this.intervals_.splice(overlapData.overlapStart + 1, 0, new TimeInterval(interval.end, firstInterval.end));
                    return;
                }
                deleteStart++;
            }

            const lastInterval = this.intervals_[overlapData.overlapEnd];
            if (lastInterval.end.isAfter(interval.end)) {
                lastInterval.setStart(interval.end);
                deleteEnd--;
            }

            const deleteRange = deleteEnd - deleteStart;
            if (deleteRange > 0) {
                this.intervals_.splice(deleteStart, deleteRange);
            }
        }
    }

    /**
     * Get the intervals as an array
     * @returns A sorted array of non overlapping time intervals
     */
    getIntervals() {
        return this.intervals_.slice();
    }

    private getOverlappingData(interval: TimeInterval) {
        let prevIdx = this.intervals_.length - 1,
            overlapStart = -1,
            overlapEnd = -1;
        for (let idx = 0; idx < this.intervals_.length; ++idx) {
            const item = this.intervals_[idx];
            if (item.end.isSameOrAfter(interval.start)) {
                prevIdx = idx - 1;
                if (item.start.isSameOrBefore(interval.end)) {
                    overlapStart = idx;
                }
                break;
            }
        }

        if (overlapStart !== -1) {
            for (let idx = overlapStart; idx < this.intervals_.length; ++idx) {
                const item = this.intervals_[idx];
                if (item.start.isAfter(interval.end)) {
                    overlapEnd = idx - 1;
                    break;
                }
            }
            if (overlapEnd === -1) {
                overlapEnd = this.intervals_.length - 1;
            }
        }

        return {
            prevIdx: prevIdx,
            overlapStart: overlapStart,
            overlapEnd: overlapEnd
        };
    }
}
