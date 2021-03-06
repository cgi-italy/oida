import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const BOOLEAN_FIELD_ID = 'boolean';

export type BooleanField = FormField<typeof BOOLEAN_FIELD_ID, boolean, Record<string, never>>;

setFormFieldSerializer(BOOLEAN_FIELD_ID, {
    toString: (formField) => {
        return formField.value ? 'true' : 'false';
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [BOOLEAN_FIELD_ID]: FormFieldDefinition<typeof BOOLEAN_FIELD_ID, boolean, Record<string, never>>;
    }

    interface IFormFieldValueTypes {
        [BOOLEAN_FIELD_ID]: boolean;
    }
}
