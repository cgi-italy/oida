export type FormFieldRendererConfig = {
    id?: string,
    props?: {[x: string] : any}
};

export type FormFieldCommonConfig<TYPE extends string> = {
    type: TYPE;
    name: string;
    title?: string;
    required?: boolean;
    rendererConfig?: FormFieldRendererConfig;
};

export type FormFieldConfig<TYPE extends string, CONFIG> = {
    config: CONFIG;
} & FormFieldCommonConfig<TYPE>;


export type FormFieldState<T> = {
    value: T | undefined;
    onChange: (value: T | undefined) => void;
};

export type FormFieldConfigFromState<TYPE extends string, CONFIG, T> = {
    config: (state: FormFieldState<T>) => CONFIG;
} & FormFieldCommonConfig<TYPE>;

export type FormField<TYPE extends string, T, CONFIG> = FormFieldConfig<TYPE, CONFIG> & FormFieldState<T>;


export type FormFieldDefinition<TYPE extends string, T, CONFIG> =
    FormFieldConfig<TYPE, CONFIG> | FormFieldConfigFromState<TYPE, CONFIG, T>;

export const isFormFieldConfigFromState = <TYPE extends string, T, CONFIG>(definition: FormFieldDefinition<TYPE, T, CONFIG>):
definition is FormFieldConfigFromState<TYPE, CONFIG, T> => {
    return typeof(definition.config) === 'function';
};


export type FormFieldValues = Map<string, any>;

export type AnyFormFieldDefinition = FormFieldDefinition<string, any, any>;
export type AnyFormField = FormField<string, any, any>;
