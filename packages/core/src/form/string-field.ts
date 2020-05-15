
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const STRING_FIELD_ID = 'string';

export type StringField = FormField<typeof STRING_FIELD_ID, string, {
    validationRegex?: RegExp
}>;


setFormFieldSerializer(STRING_FIELD_ID, {
    toString: (formField) => {
        return `"${formField.value}"`;
    }
});
