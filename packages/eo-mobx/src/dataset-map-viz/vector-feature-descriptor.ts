/**
 * The feature property formatter output types. Can be extended through declaration merging (e.g. for jsx output)
 */
export interface VectorFeaturePropertyFormatterOutputTypes {
    string: string;
    undefined: undefined;
}

/**
 * The feature property formatter type
 * @param value The property value
 * @param idx When the feature property is an array of values, the item index will be passed to the formatter function
 * @return The formatted value (typically as a string). If undefined the property will not be displayed
 */
export type VectorFeaturePropertyFormatter<TYPE extends keyof FeaturePropertyValueTypes = keyof FeaturePropertyValueTypes> = (
    value: FeaturePropertyValueTypes[TYPE],
    idx?: number
) => VectorFeaturePropertyFormatterOutputTypes[keyof VectorFeaturePropertyFormatterOutputTypes];

/**
 * The feature property parser type
 */
export type VectorFeaturePropertyParser<TYPE extends keyof FeaturePropertyValueTypes = keyof FeaturePropertyValueTypes> = (
    value: any
) => FeaturePropertyValueTypes[TYPE];

/**
 * Base feature property descriptor type
 */
export type FeaturePropertyDescriptorCommon<TYPE extends keyof FeaturePropertyValueTypes> = {
    /** Property type identifier */
    type: TYPE;
    /** The feature property key */
    id: string;
    /** The feature property title */
    name: string;
    /** The feature property description */
    description?: string;
    /** A boolean flag indicating if filtering should be enabled for this property */
    filterable?: boolean;
    /** A boolean flag indicating if the property is an array of values */
    isArray?: boolean;
    /** A boolean flag indicating if the feature is required*/
    required?: boolean;
    /** The feature property units */
    units?: string;
    /** An optional formatter function used for value display. When undefined is returned the property value will be omitted */
    formatter?: VectorFeaturePropertyFormatter<TYPE>;
    /** An optional parser used to transform the raw feature value to the property value type (e.g. a string to a Date) */
    parser?: VectorFeaturePropertyParser<TYPE>;
    /**
     * A function used to extract the value from the feature properties object. If not provided the assumption is that
     * the property id can be used to index the value from the feature properties (i.e. value = properties[id])
     */
    valueExtractor?: (properties: VectorFeatureProperties) => FeaturePropertyValueTypes[TYPE];
};

export const STRING_FEATURE_PROPERTY_TYPE = 'string';
/** A feature property descriptor for a string type */
export type StringFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof STRING_FEATURE_PROPERTY_TYPE> & {
    subType?: 'url' | 'imageUrl';
};

export const BOOLEAN_FEATURE_PROPERTY_TYPE = 'boolean';
/** A feature property descriptor for a boolean type */
export type BooleanFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof BOOLEAN_FEATURE_PROPERTY_TYPE>;

export const NUMERIC_FEATURE_PROPERTY_TYPE = 'number';
/** A feature property descriptor for a numeric type*/
export type NumericFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof NUMERIC_FEATURE_PROPERTY_TYPE> & {
    /** An optional range of ammissible values */
    domain?: {
        min: number;
        max: number;
    };
};

export const ENUM_FEATURE_PROPERTY_TYPE = 'enum';
/** A feature property descriptor for an enum type*/
export type EnumFeaturePropertyOption = {
    name: string;
    value: string | number;
};
export type EnumFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof ENUM_FEATURE_PROPERTY_TYPE> & {
    /** The enum allowed values */
    options: EnumFeaturePropertyOption[];
};

export const DATE_FEATURE_PROPERTY_TYPE = 'date';
/** A feature property descriptor for a date type */
export type DateFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof DATE_FEATURE_PROPERTY_TYPE> & {
    /** An optional range of ammissible values */
    domain?: {
        min: Date;
        max: Date;
    };
};

export const COMPOSITE_FEATURE_PROPERTY_TYPE = 'composite';
/** A feature property descriptor for a composite type (i.e. an object of properties) */
export type CompositeFeaturePropertyDescriptor = FeaturePropertyDescriptorCommon<typeof COMPOSITE_FEATURE_PROPERTY_TYPE> & {
    properties: VectorFeaturePropertyDescriptor[];
};

/** The property value type for each descriptor */
export interface FeaturePropertyValueTypes {
    [STRING_FEATURE_PROPERTY_TYPE]: string;
    [BOOLEAN_FEATURE_PROPERTY_TYPE]: boolean;
    [NUMERIC_FEATURE_PROPERTY_TYPE]: number;
    [ENUM_FEATURE_PROPERTY_TYPE]: string | number;
    [DATE_FEATURE_PROPERTY_TYPE]: Date;
    [COMPOSITE_FEATURE_PROPERTY_TYPE]: {
        [key: string]: FeaturePropertyValueTypes[keyof FeaturePropertyValueTypes];
    };
}

/**
 * The feature property descriptor type
 */
export type VectorFeaturePropertyDescriptor =
    | StringFeaturePropertyDescriptor
    | BooleanFeaturePropertyDescriptor
    | NumericFeaturePropertyDescriptor
    | EnumFeaturePropertyDescriptor
    | DateFeaturePropertyDescriptor
    | CompositeFeaturePropertyDescriptor;

/**
 * The feature descriptor type. Defines the schema of a vector feature
 */
export type VectorFeatureDescriptor = {
    typeName: string;
    title?: string;
    description?: string;
    properties: VectorFeaturePropertyDescriptor[];
};

export type FeaturePropertyValueType = FeaturePropertyValueTypes[keyof FeaturePropertyValueTypes];

/** The feature property object type */
export type VectorFeatureProperties = Record<string, FeaturePropertyValueType | FeaturePropertyValueType[]>;
