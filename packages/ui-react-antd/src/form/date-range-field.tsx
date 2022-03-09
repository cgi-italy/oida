import React from 'react';

import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import moment from 'moment';

import { DateRangeField, DATE_RANGE_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const DateRangeFieldRenderer = (
    props: FormFieldRendererBaseProps<DateRangeField> & Omit<RangePickerProps, 'value' | 'onChange'>
) => {
    const { value, onChange, title, required, config, autoFocus, ...renderProps } = props;

    const onDateChange = (range) => {
        if (range && range.length === 2) {
            if (!config.withTime) {
                range[0].set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });
                range[1].set({
                    hour: 23,
                    minute: 59,
                    second: 59
                });
            }
            range[0].set({
                millisecond: 0
            });
            range[1].set({
                millisecond: 0
            });
            onChange({
                start: range[0].add(range[0].utcOffset(), 'minutes').toDate(),
                end: range[1].add(range[1].utcOffset(), 'minutes').toDate()
            });
        } else {
            onChange(undefined);
        }
    };

    let disabledDates;
    if (config.minDate || config.maxDate) {
        disabledDates = (current: moment.Moment) => {
            return (
                (config.minDate && current.isBefore(config.minDate, 'date')) || (config.maxDate && current.isAfter(config.maxDate, 'date'))
            );
        };
    }

    return (
        <DatePicker.RangePicker
            value={value ? [moment.utc(value.start), moment.utc(value.end)] : undefined}
            onChange={onDateChange}
            disabledDate={disabledDates}
            allowClear={!props.required}
            showTime={
                config.withTime
                    ? {
                          defaultValue: [moment.utc('00:00:00', 'HH:mm:ss'), moment.utc('23:59:59', 'HH:mm:ss')]
                      }
                    : false
            }
            {...renderProps}
        ></DatePicker.RangePicker>
    );
};

antdFormFieldRendererFactory.register<DateRangeField>(DATE_RANGE_FIELD_ID, 'rangepicker', DateRangeFieldRenderer);
