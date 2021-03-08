
import moment from 'moment';
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const DATE_RANGE_FIELD_ID = 'daterange';

export type DateRangeValue = {
    start: Date,
    end: Date
};

export type DateRangeFieldConfig = {
    minDate?: Date,
    maxDate?: Date,
    withTime?: boolean;
};

export type DateRangeField = FormField<typeof DATE_RANGE_FIELD_ID, DateRangeValue, DateRangeFieldConfig>;


setFormFieldSerializer(DATE_RANGE_FIELD_ID, {
    toJSON: (value) => {
        return {
            start: value.start.toISOString(),
            end: value.end.toISOString()
        };
    },
    fromJSON: (value) => {
        return {
            start: new Date(value.start),
            end: new Date(value.end)
        };
    },
    toString: (formField, options) => {
        let config: DateRangeFieldConfig;
        if (typeof(formField.config) === 'function') {
            config = formField.config(formField);
        } else {
            config = formField.config;
        }
        let format = options?.dateFormat;
        if (!format) {
            if (config.withTime) {
                format = 'YYYY-MM-DD HH:mm:ss [UTC]';
            } else {
                format = 'YYYY-MM-DD';
            }
        }
        return formField.value
            ? `From ${moment.utc(formField.value.start).format(format)} to ${moment.utc(formField.value.end).format(format)}`
            : 'unspecified';
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [DATE_RANGE_FIELD_ID]:  FormFieldDefinition<typeof DATE_RANGE_FIELD_ID, DateRangeValue, DateRangeFieldConfig>;
    }
    interface IFormFieldValueTypes {
        [DATE_RANGE_FIELD_ID]: DateRangeValue;
    }
}

