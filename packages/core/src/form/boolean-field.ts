
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const BOOLEAN_FIELD_ID = 'boolean';

export type BooleanField = FormField<typeof BOOLEAN_FIELD_ID, boolean, {
}>;


setFormFieldSerializer(BOOLEAN_FIELD_ID, {
    toString: (formField) => {
        return formField.value ? formField.title : '';
    }
});
