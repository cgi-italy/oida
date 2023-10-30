import {
    BOOLEAN_FEATURE_PROPERTY_TYPE,
    CompositeFeaturePropertyDescriptor,
    COMPOSITE_FEATURE_PROPERTY_TYPE,
    DATE_FEATURE_PROPERTY_TYPE,
    NUMERIC_FEATURE_PROPERTY_TYPE,
    STRING_FEATURE_PROPERTY_TYPE,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor
} from '../dataset-map-viz';

export const createPropertiesDescriptorFromFeature = (featureProps: VectorFeatureProperties): VectorFeaturePropertyDescriptor[] => {
    const propsDescriptor = Object.entries(featureProps).map(([key, value]) => {
        const isArray = Array.isArray(value);
        const sampleValue = isArray ? value[0] : value;

        if (sampleValue === undefined) {
            return undefined;
        }

        const propertyDescriptor = {
            id: key,
            name: key,
            isArray: isArray,
            sortable: !isArray,
            filterable: !isArray,
            type: STRING_FEATURE_PROPERTY_TYPE
        } as VectorFeaturePropertyDescriptor;

        if (typeof sampleValue === 'number') {
            propertyDescriptor.type = NUMERIC_FEATURE_PROPERTY_TYPE;
        } else if (typeof sampleValue === 'boolean') {
            propertyDescriptor.type = BOOLEAN_FEATURE_PROPERTY_TYPE;
        } else if (sampleValue instanceof Date) {
            propertyDescriptor.type = DATE_FEATURE_PROPERTY_TYPE;
        } else if (typeof sampleValue === 'object') {
            propertyDescriptor.type = COMPOSITE_FEATURE_PROPERTY_TYPE;
            propertyDescriptor.sortable = false;
            propertyDescriptor.filterable = false;
            (propertyDescriptor as CompositeFeaturePropertyDescriptor).properties = createPropertiesDescriptorFromFeature(sampleValue);
        }

        return propertyDescriptor;
    });

    return propsDescriptor.filter((descriptor) => descriptor !== undefined) as VectorFeaturePropertyDescriptor[];
};

export const createPropertiesDescriptorFromFeatures = (featuresProps: VectorFeatureProperties[]): VectorFeaturePropertyDescriptor[] => {
    const inferencedProps: Record<string, VectorFeaturePropertyDescriptor> = {};
    featuresProps.forEach((featureProps) => {
        Object.keys(featureProps).forEach((propertyId) => {
            if (!inferencedProps[propertyId]) {
                const descriptor = createPropertiesDescriptorFromFeature({
                    [propertyId]: featureProps[propertyId]
                });
                inferencedProps[propertyId] = descriptor[0];
            }
        });
    });

    return Object.values(inferencedProps);
};
