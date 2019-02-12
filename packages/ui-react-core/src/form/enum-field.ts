
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const ENUM_FIELD_ID = 'enum';

export type EnumField = FormField<typeof ENUM_FIELD_ID, string | string[], {
    choices: Array<{name: string, value: string}>;
    multiple?: boolean;
}>;

setFormFieldSerializer(ENUM_FIELD_ID, {
    toString: (formField) => {
        let selection = [];
        if (typeof(formField.value) === 'string') {
            selection = [formField.value];
        } else {
            selection = [...formField.value];
        }

        if (selection.length <= 2) {
            return selection.map((val) => {
                let choice = formField.config.choices.find((choice) => {
                    return choice.value === val;
                });
                return choice ? choice.name : val;
            }).join(' or ');
        } else {
            return `${formField.title}: ${selection.length} selected`;
        }
    }
});
