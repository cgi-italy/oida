import React from 'react';

import { DatePicker } from 'antd';
import moment from 'moment';

import { DateRangeField, DATE_RANGE_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export class DateRangeFieldRenderer extends React.Component<DateRangeField> {

    onDateChange(range) {
        if (range && range.length === 2) {
            this.props.onChange({
                start: range[0].toDate(),
                end: range[1].toDate(),
            });
        } else {
            this.props.onChange(undefined);
        }
    }

    render() {

        let { value, onChange, config, ...renderProps } = this.props;

        let disabledDates;
        if (config.minDate || config.maxDate) {
            disabledDates = (current: moment.Moment) => {
                return current.isBefore(config.minDate) || current.isAfter(config.maxDate);
            };
        }


        return (
            <DatePicker.RangePicker
                size='small'
                value={value ? [moment(value.start), moment(value.end)] : undefined}
                onChange={this.onDateChange.bind(this)}
                disabledDate={disabledDates}
                {...renderProps}
            >
            </DatePicker.RangePicker>
        );
    }
}

antdFormFieldRendererFactory.register<DateRangeField>(
    DATE_RANGE_FIELD_ID, 'rangepicker',
    (props) => <DateRangeFieldRenderer {...props}></DateRangeFieldRenderer>
);
