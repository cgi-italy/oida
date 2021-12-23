import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const NUMERIC_RANGE_FIELD_ID = 'numericrange';

export type NumericRangeFieldConfig = {
    min?: number;
    max?: number;
    step?: number;
};

export type NumericRangeFieldValue = {
    from: number;
    to: number;
};

export type NumericRangeField = FormField<typeof NUMERIC_RANGE_FIELD_ID, NumericRangeFieldValue, NumericRangeFieldConfig>;

setFormFieldSerializer(NUMERIC_RANGE_FIELD_ID, {
    toString: (formField) => {
        if (!formField.value) {
            return 'unspecified';
        }
        return `From ${formField.value.from} to ${formField.value.to}`;
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [NUMERIC_RANGE_FIELD_ID]: FormFieldDefinition<typeof NUMERIC_RANGE_FIELD_ID, NumericRangeFieldValue, NumericRangeFieldConfig>;
    }

    interface IFormFieldValueTypes {
        [NUMERIC_RANGE_FIELD_ID]: NumericRangeFieldValue;
    }
}
