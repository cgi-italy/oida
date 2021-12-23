import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const STRING_FIELD_ID = 'string';

export type StringFieldConfig = {
    validationRegex?: RegExp;
};

export type StringField = FormField<typeof STRING_FIELD_ID, string, StringFieldConfig>;

setFormFieldSerializer(STRING_FIELD_ID, {
    toString: (formField) => {
        return `${formField.value}`;
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [STRING_FIELD_ID]: FormFieldDefinition<typeof STRING_FIELD_ID, string, StringFieldConfig>;
    }

    interface IFormFieldValueTypes {
        [STRING_FIELD_ID]: string;
    }
}
