import { DateRangeValue } from '@oidajs/core';

export const getWcsTimeFilterSubset = (timeFilter: Date | DateRangeValue | undefined) => {
    if (timeFilter) {
        if (timeFilter instanceof Date) {
            return `unix(${timeFilter.toISOString()})`;
        } else {
            return `unix(${timeFilter.start.toISOString()},${timeFilter.end.toISOString()})`;
        }
    } else {
        return undefined;
    }
};
