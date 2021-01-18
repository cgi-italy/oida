import { AnyFormFieldDefinition, FormFieldValues } from '@oida/core';

export type DataFiltererProps = {
    filters: Array<AnyFormFieldDefinition>;
    values: FormFieldValues;
    onFilterChange: (name: string, value: any) => void;
    mainFilter?: string;
};

export type DataFiltererRenderer = (props: DataFiltererProps) => React.ReactNode;
