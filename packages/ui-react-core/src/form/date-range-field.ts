
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const DATE_RANGE_FIELD_ID = 'daterange';

export type DateRangeField = FormField<typeof DATE_RANGE_FIELD_ID, {start: Date, end: Date}, {
    minDate?: Date,
    maxDate?: Date,
    withTime?: boolean;
}>;


setFormFieldSerializer(DATE_RANGE_FIELD_ID, {
    toKVP: (formField) => {
        return {
            [formField.name]: {
                start: formField.value.start.toISOString(),
                end: formField.value.end.toISOString()
            }
        };
    },
    fromKVP: (queryParams, name) => {
        let value = queryParams[name];
        if (value) {
            return {
                start: new Date(value.start),
                end: new Date(value.end)
            };
        } else {
            return null;
        }
    },
    toString: (formField) => {
        if (formField.config.withTime) {
            return `From ${formField.value.start.toISOString()} to ${formField.value.end.toISOString()}`;
        } else {
            return `From ${formField.value.start.toISOString().substr(0, 10)} to ${formField.value.end.toISOString().substr(0, 10)}`;
        }
    }
});
