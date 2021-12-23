import moment from 'moment';

import { FormatterQuantity } from './formatter';

export type DateFormatterOptions = {
    format?: string;
};

export const DateQuantity: FormatterQuantity<moment.MomentInput, DateFormatterOptions> = {
    id: 'date'
};

export const formatDate = (date: moment.MomentInput, options: DateFormatterOptions) => {
    try {
        return moment.utc(date).format(options.format);
    } catch (e) {
        return 'N/A';
    }
};
