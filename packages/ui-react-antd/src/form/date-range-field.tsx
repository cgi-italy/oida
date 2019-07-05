import React from 'react';

import { DatePicker } from 'antd';
import moment from 'moment';

import { DateRangeField, DATE_RANGE_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const DateRangeFieldRenderer = (props: DateRangeField) => {

    let { value, onChange, config, rendererConfig } = props;

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
            onChange({
                start: range[0].toDate(),
                end: range[1].toDate(),
            });
        } else {
            onChange(undefined);
        }
    };


    let disabledDates;
    if (config.minDate || config.maxDate) {
        disabledDates = (current: moment.Moment) => {
            return current.isBefore(config.minDate) || current.isAfter(config.maxDate);
        };
    }


    let renderProps = rendererConfig ? rendererConfig.props || {} : {};

    return (
        <DatePicker.RangePicker
            size='small'
            value={value ? [moment(value.start), moment(value.end)] : undefined}
            onChange={onDateChange}
            disabledDate={disabledDates}
            showTime={config.withTime ? {
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
            } : false}
            {...renderProps}
        >
        </DatePicker.RangePicker>
    );

};

antdFormFieldRendererFactory.register<DateRangeField>(
    DATE_RANGE_FIELD_ID, 'rangepicker',
    DateRangeFieldRenderer
);
