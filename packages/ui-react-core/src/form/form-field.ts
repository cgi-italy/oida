export type FormFieldRendererConfig = {
    id?: string,
    props?: {[x: string] : any}
};

export type FormFieldCommonConfig<TYPE extends string> = {
    name: string;
    title?: string;
    required?: boolean;
    type: TYPE;
    rendererConfig?: FormFieldRendererConfig;
};

export type FormFieldConfig<TYPE extends string, CONFIG> = {
    config: CONFIG;
} & FormFieldCommonConfig<TYPE>;


export type FormFieldState<T> = {
    value: T;
    onChange: (value: T) => void;
};

export type FormField<TYPE extends string, T, CONFIG> = FormFieldConfig<TYPE, CONFIG> & FormFieldState<T>;

export type FormFieldRenderer<T extends FormField<any, any, any>> = (props: T) => React.ReactNode;

export type FormFieldDefinitionWithWrapper<TYPE extends string, T, CONFIG> = {
    wrapper: (props: FormField<TYPE, T, CONFIG> & {render: FormFieldRenderer<FormField<TYPE, T, CONFIG>>}) => React.ReactNode;
} & FormFieldCommonConfig<TYPE> & {
    config?: Partial<CONFIG>
};

export const isFormFieldDefinitionWithWrapper = <TYPE extends string, T, CONFIG>(config: FormFieldDefinition<TYPE, T, CONFIG>):
    config is FormFieldDefinitionWithWrapper<TYPE, T, CONFIG> => {
    return (<FormFieldDefinitionWithWrapper<TYPE, T, CONFIG>>config).wrapper !== undefined;
};

export type FormFieldDefinition<TYPE extends string, T, CONFIG> =
    FormFieldConfig<TYPE, CONFIG> | FormFieldDefinitionWithWrapper<string, T, CONFIG>;

export type FormFieldValues = Map<string, any>;

export type AnyFormFieldDefinition = FormFieldDefinition<string, any, any>;
export type AnyFormField = FormField<string, any, any>;
