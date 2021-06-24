import { FormFieldValues, IFormFieldDefinition } from '@oida/core';

/** {@Link FormRenderer} props */
export type FormRendererProps = {
    /** The list of form fields */
    fields: IFormFieldDefinition[],
    /**
     * The current form field values as a map where each entry is a
     * field name with its corresponding value
    */
    values: FormFieldValues,
    /**
     * Callback invoked when a field values is updated
     */
    onFieldChange: (name: string, value: any) => void;
};

/** A form renderer component */
export type FormRenderer = React.ComponentType<FormRendererProps>;
