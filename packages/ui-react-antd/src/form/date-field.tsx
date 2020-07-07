import React from 'react';

import { DatePicker } from 'antd';
import moment from 'moment';

import { DateField, DATE_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const DateFieldRenderer = (props: Omit<DateField, 'name' | 'type'>) => {

    let { value, onChange, config, rendererConfig } = props;

    const onDateChange = (value: moment.Moment | null) => {
        if (value) {
            if (!config.withTime) {
                value.set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                });
            }
            onChange(value.toDate());
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
        <DatePicker
            value={moment.utc(value)}
            onChange={onDateChange}
            allowClear={!props.required}
            disabledDate={disabledDates}
            showTime={config.withTime ? {
                defaultValue: moment.utc('00:00:00', 'HH:mm:ss')
            } : false}
            {...renderProps}
        >
        </DatePicker>
    );

};

antdFormFieldRendererFactory.register<DateField>(
    DATE_FIELD_ID, 'datepicker',
    DateFieldRenderer
);
