import React from 'react';

import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';

import { DateRangeField, DATE_RANGE_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const DateRangeFieldRenderer = (
    props: FormFieldRendererBaseProps<DateRangeField> & Omit<RangePickerProps, 'value' | 'onChange'>
) => {
    const { value, onChange, title, required, config, autoFocus, readonly, ...renderProps } = props;

    const onDateChange = (range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (range && range[0] && range[1]) {
            if (!config.withTime) {
                range[0] = range[0].set('hour', 0).set('minute', 0).set('second', 0);
                range[1] = range[1].set('hour', 23).set('minute', 59).set('second', 59);
            }

            onChange({
                start: range[0].set('millisecond', 0).add(range[0].utcOffset(), 'minutes').toDate(),
                end: range[1].set('millisecond', 0).add(range[1].utcOffset(), 'minutes').toDate()
            });
        } else {
            onChange(undefined);
        }
    };

    let disabledDates;
    if (config.minDate || config.maxDate) {
        disabledDates = (current: dayjs.Dayjs) => {
            return (
                (config.minDate && current.isBefore(config.minDate, 'date')) || (config.maxDate && current.isAfter(config.maxDate, 'date'))
            );
        };
    }

    return (
        <DatePicker.RangePicker
            value={value ? [dayjs.utc(value.start), dayjs.utc(value.end)] : undefined}
            onChange={onDateChange}
            disabledDate={disabledDates}
            allowClear={!required && !readonly}
            inputReadOnly={readonly}
            open={readonly ? false : undefined}
            showTime={
                config.withTime
                    ? {
                          defaultValue: [dayjs.utc('00:00:00', 'HH:mm:ss'), dayjs.utc('23:59:59', 'HH:mm:ss')]
                      }
                    : false
            }
            {...renderProps}
        ></DatePicker.RangePicker>
    );
};

antdFormFieldRendererFactory.register<DateRangeField>(DATE_RANGE_FIELD_ID, 'rangepicker', DateRangeFieldRenderer);
