import moment from 'moment';
import 'moment-duration-format';

/**
 * check moment-duration-format documentation
 * https://github.com/jsmreese/moment-duration-format
 */
export type MomentDurationFormatOptions = {
    trim?: string;
    trunc?: boolean;
    largest?: number;
    minValue?: number;
    maxValue?: number;
    forceLength?: boolean;
    useSignificantDigits?: boolean;
    precision?: number;
};

declare module 'moment' {
    interface Duration {
        format(template: string, options?: MomentDurationFormatOptions);
    }
}

import { FormatterQuantity } from './formatter';

export type DurationInput =
    | moment.Duration
    | [moment.DurationInputArg1, moment.DurationInputArg2?]
    | {
          start: moment.MomentInput;
          end?: moment.MomentInput;
      };

export type DurationFormatterOptions = {
    format?: string;
    humanize?: boolean;
} & MomentDurationFormatOptions;

export const DurationQuantity: FormatterQuantity<DurationInput, DurationFormatterOptions> = {
    id: 'duration'
};

function isDurationInstance(duration: DurationInput): duration is moment.Duration {
    return typeof (duration as moment.Duration).clone === 'function';
}

export const formatDuration = (duration: DurationInput, options?: DurationFormatterOptions) => {
    let durationInstance: moment.Duration;
    if (Array.isArray(duration)) {
        durationInstance = moment.duration(...duration);
    } else if (isDurationInstance(duration)) {
        durationInstance = duration.clone();
    } else {
        if (!duration.end && options?.humanize) {
            // when no end date is specified the time relative to now is shown
            return moment.utc(duration.start).fromNow();
        } else {
            durationInstance = moment.duration(moment(duration.end).diff(duration.start));
        }
    }

    if (!durationInstance.isValid()) {
        return 'N/A';
    }

    if (options?.humanize) {
        return durationInstance.humanize();
    } else {
        const { format, ...settings } = {
            format: 'y [years], M [months], d [days], h [hours], m [minutes], s [seconds]',
            trim: 'both mid',
            ...options
        };
        return durationInstance.format(format, settings);
    }
};
