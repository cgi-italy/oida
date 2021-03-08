import React from 'react';

import { DatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import moment from 'moment';

import { FormFieldRendererBaseProps } from '@oida/ui-react-core';
import { DateField, DATE_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';


export const DateFieldRenderer = (props: FormFieldRendererBaseProps<DateField> & Omit<DatePickerProps, 'value' | 'onChange'>) => {

    const {value, onChange, title, required, config, autoFocus, ...renderProps} = props;

    const onDateChange = (value: moment.Moment | null) => {
        if (value) {
            if (!config.withTime) {
                value.set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });
            }
            value.set({millisecond: 0});
            onChange(value.add(value.utcOffset(), 'minutes').toDate());
        } else {
            onChange(undefined);
        }
    };


    let disabledDates;
    if (config.minDate || config.maxDate) {
        disabledDates = (current: moment.Moment) => {
            return (config.minDate && current.isBefore(config.minDate)) || (config.maxDate && current.isAfter(config.maxDate));
        };
    }


    return (
        <DatePicker
            value={value ? moment.utc(value) : undefined}
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
