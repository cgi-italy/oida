import { AnyFormFieldDefinition, FormFieldValues } from '@oida/core';

export type DataFiltererProps = {
    filters: Array<AnyFormFieldDefinition>;
    values: FormFieldValues
    onFilterChange: (name: string, value: any) => void;
};

export type DataFiltererRenderer = (props: DataFiltererProps) => React.ReactNode;
