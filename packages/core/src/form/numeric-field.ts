
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const NUMERIC_FIELD_ID = 'numeric';

export type NumericFieldConfig = {
    min?: number,
    max?: number,
    step?: number
};

export type NumericField = FormField<typeof NUMERIC_FIELD_ID, number, NumericFieldConfig>;


setFormFieldSerializer(NUMERIC_FIELD_ID, {
    toString: (formField) => {
        if (!formField.value) {
            return 'unspecified';
        }
        return `${formField.value}`;
    }
});


declare module './form-field' {
    interface IFormFieldDefinitions {
        [NUMERIC_FIELD_ID]:  FormFieldDefinition<typeof NUMERIC_FIELD_ID, number, NumericFieldConfig>;
    }

    interface IFormFieldValueTypes {
        [NUMERIC_FIELD_ID]: number;
    }
}
