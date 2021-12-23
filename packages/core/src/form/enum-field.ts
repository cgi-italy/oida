import { FormField } from './form-field';
import { setFormFieldSerializer } from './form-field-serialization';

export const ENUM_FIELD_ID = 'enum';

export type EnumChoice = {
    name: string;
    value: string;
    description?: string;
    icon?: string;
};

export type EnumFieldConfig = {
    choices: EnumChoice[] | (() => Promise<EnumChoice[]>);
    multiple?: boolean;
};

export type EnumField = FormField<typeof ENUM_FIELD_ID, string | string[], EnumFieldConfig>;

setFormFieldSerializer(ENUM_FIELD_ID, {
    toString: (formField, options) => {
        if (!formField.value) {
            return 'unspecified';
        }
        let selection: string[] = [];
        if (Array.isArray(formField.value)) {
            selection = [...formField.value];
        } else {
            selection = [formField.value];
        }

        const maxExpand = options?.enumMaxExpand || 2;
        if (selection.length <= maxExpand) {
            let config: EnumFieldConfig;
            if (typeof formField.config === 'function') {
                config = formField.config(formField);
            } else {
                config = formField.config;
            }
            return selection
                .map((val) => {
                    let selectedChoice: EnumChoice | undefined;
                    if (Array.isArray(config.choices)) {
                        selectedChoice = config.choices.find((choice) => {
                            return choice.value === val;
                        });
                    }
                    return selectedChoice ? selectedChoice.name : val;
                })
                .join(' or ');
        } else {
            return `${selection.length} selected`;
        }
    }
});

declare module './form-field' {
    interface IFormFieldDefinitions {
        [ENUM_FIELD_ID]: FormFieldDefinition<typeof ENUM_FIELD_ID, string | string[], EnumFieldConfig>;
    }
    interface IFormFieldValueTypes {
        [ENUM_FIELD_ID]: string | string[];
    }
}
