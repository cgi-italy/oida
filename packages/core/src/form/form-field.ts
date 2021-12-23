/**
 * Form field renderer specific configuration type
 */
export type FormFieldRendererConfig = {
    /**
     * The renderer unique identifier
     */
    id?: string;
    /**
     * The renderer specific properties
     */
    props?: Record<string, any>;
};

/**
 * Common form field definition parameters
 * @template TYPE The form field string identifier
 */
export type FormFieldCommon<TYPE extends string> = {
    /**
     * Unique form field identifier
     */
    type: TYPE;
    /**
     * Form field name
     */
    name: string;
    /**
     * Form field title
     */
    title?: string;
    /**
     * Form field description
     */
    description?: string;
    /**
     * Flag indicating if this field is required
     */
    required?: boolean;
    /**
     * Flag indicating if the field should be focused on form creation
     */
    autoFocus?: boolean;
    /**
     * renderer specific configuration
     */
    rendererConfig?: FormFieldRendererConfig;
};

/**
 * Form field state type
 * @template T The form field value type
 */
export type FormFieldState<T> = {
    value: T | undefined;
    onChange: (value: T | undefined) => void;
};

/**
 * Form field type specific config. Config can also be defined as a function of the form field state
 * @template CONFIG the form field config
 */
export type FormFieldConfig<CONFIG, T> = CONFIG | ((state: FormFieldState<T>) => CONFIG);

/**
 * Form field definition type. It combines common and field specific configuration
 */
export type FormFieldDefinition<TYPE extends string, T, CONFIG> = FormFieldCommon<TYPE> & {
    config: FormFieldConfig<CONFIG, T>;
};

/**
 * Form field type. It combines field configuration and state
 */
export type FormField<TYPE extends string, T, CONFIG> = FormFieldCommon<TYPE> & { config: CONFIG } & FormFieldState<T>;

// use declaration merging to register new form fields
export interface IFormFieldDefinitions {}

export interface IFormFieldValueTypes {}

export type IFormFieldType = keyof IFormFieldDefinitions;
export type IFormFieldDefinition<TYPE extends IFormFieldType = IFormFieldType> = IFormFieldDefinitions[TYPE];
export type IFormFieldValueType<TYPE extends IFormFieldType = IFormFieldType> = IFormFieldValueTypes[TYPE];
export type IFormField<TYPE extends IFormFieldType = IFormFieldType> = IFormFieldDefinition<TYPE> &
    FormFieldState<IFormFieldValueTypes[TYPE]>;

export type FormFieldValues = Map<string, any>;
