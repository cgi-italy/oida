import moment from 'moment';

import { FormatterQuantity } from './formatter';

export type DateFormatterOptions = {
    format?: string;
};

export const DateQuantity: FormatterQuantity<moment.MomentInput, DateFormatterOptions> = {
    id: 'date'
};

export const formatDate = (date: moment.MomentInput, options?: DateFormatterOptions) => {
    try {
        const dt = moment.utc(date);
        if (dt.isValid()) {
            return dt.format(options?.format);
        } else {
            return 'N/A';
        }
    } catch (e) {
        return 'N/A';
    }
};
