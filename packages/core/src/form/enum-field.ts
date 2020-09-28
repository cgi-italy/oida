
import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const ENUM_FIELD_ID = 'enum';

export type EnumChoice = {
    name: string,
    value: string,
    description?: string
};

export type EnumField = FormField<typeof ENUM_FIELD_ID, string | string[], {
    choices: EnumChoice[] | (() => Promise<EnumChoice[]>);
    multiple?: boolean;
}>;

setFormFieldSerializer<EnumField>(ENUM_FIELD_ID, {
    toString: (formField) => {
        let selection: string[] = [];
        if (Array.isArray(formField.value)) {
            selection = [...formField.value];
        } else {
            selection = [formField.value];
        }

        if (selection.length <= 2) {
            return selection.map((val) => {
                let choice: EnumChoice | undefined;
                if (Array.isArray(formField.config.choices)) {
                    choice = formField.config.choices.find((choice) => {
                    return choice.value === val;
                    });
                }
                return choice ? choice.name : val;
            }).join(' or ');
        } else {
            return `${formField.title}: ${selection.length} selected`;
        }
    }
});
