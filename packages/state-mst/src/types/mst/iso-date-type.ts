import { types } from 'mobx-state-tree';

import moment from 'moment';

export const IsoDate = types.custom<string, Date>({
    name: 'IsoDate',
    fromSnapshot(value: string): Date {
        return moment.utc(value).toDate();
    },
    toSnapshot(value: Date): string {
        return moment.utc(value).toISOString();
    },
    isTargetType(value) {
        return value instanceof Date;
    },
    getValidationMessage(snapshot) {
        if (!moment.utc(snapshot, undefined, true).isValid()) {
            return `value ${snapshot} is not assignable to type IsoDate`;
        } else {
            return '';
        }
    }
});
