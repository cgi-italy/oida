import { FormFieldValues, IFormFieldDefinition } from '@oida/core';

export type FormRendererProps = {
    fields: IFormFieldDefinition[],
    values: FormFieldValues,
    onFieldChange: (name: string, value: any) => void;
};

export type FormRenderer<P extends FormRendererProps> = (props: P) => React.ReactNode;
