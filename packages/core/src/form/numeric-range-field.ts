
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const NUMERIC_RANGE_FIELD_ID = 'numericrange';

export type NumericRangeField = FormField<typeof NUMERIC_RANGE_FIELD_ID, {from: number, to: number}, {
    min?: number,
    max?: number,
    step?: number
}>;


setFormFieldSerializer(NUMERIC_RANGE_FIELD_ID, {
    toString: (formField) => {
        return `From ${formField.value.start} to ${formField.value.end}`;
    }
});
