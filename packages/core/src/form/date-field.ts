
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const DATE_FIELD_ID = 'date';

export type DateField = FormField<typeof DATE_FIELD_ID, Date, {
    minDate?: Date,
    maxDate?: Date,
    withTime?: boolean;
}>;


setFormFieldSerializer(DATE_FIELD_ID, {
    toJSON: (value) => {
        return value.toISOString();
    },
    fromJSON: (value) => {
        return new Date(value);
    },
    toString: (formField) => {
        if (formField.config.withTime) {
            return `${formField.title}: ${formField.value.toISOString()}`;
        } else {
            return `${formField.title}: ${formField.value.toISOString().substr(0, 10)}`;
        }
    }
});
