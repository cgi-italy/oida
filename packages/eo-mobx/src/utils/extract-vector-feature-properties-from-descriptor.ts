import moment from 'moment';

import {
    DATE_FEATURE_PROPERTY_TYPE,
    FeaturePropertyValueType,
    VectorFeatureDescriptor,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor
} from '../dataset-map-viz/vector-feature-descriptor';

/**
 * Extract a property value given its descriptor and the feature properties record.
 * In particular use the {@link VectorFeaturePropertyDescriptor.valueExtractor} to extract
 * the value from the properties and apply any {@link VectorFeaturePropertyDescriptor.parser}
 * defined in the descriptor
 *
 * @param property The feature property descriptor
 * @param featureProps The feature properties
 * @returns The extracted feature property value
 */
export const extractVectorFeaturePropertyValue = (
    property: VectorFeaturePropertyDescriptor,
    featureProps: VectorFeatureProperties
): FeaturePropertyValueType | FeaturePropertyValueType[] => {
    const rawValue = property.valueExtractor ? property.valueExtractor(featureProps) : featureProps[property.id];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        if (property.parser) {
            return property.parser(rawValue);
        } else if (property.type === DATE_FEATURE_PROPERTY_TYPE && !(rawValue instanceof Date)) {
            if (typeof rawValue === 'string') {
                const dateValue = moment.utc(rawValue, property.inputStringFormat);
                return dateValue.isValid() ? dateValue.toDate() : undefined;
            } else {
                return undefined;
            }
        } else {
            return rawValue;
        }
    } else {
        return undefined;
    }
};

/**
 * Apply the {@link extractVectorFeaturePropertyValue} to extract all properties
 * given a feature descriptor
 * @param descriptor The feature descriptor
 * @param rawFeatureProps The input feature properties record
 * @returns The feature properties extracted from the input feature properties record
 */
export const exctractVectorFeaturePropertiesFromDescriptor = (
    descriptor: VectorFeatureDescriptor,
    rawFeatureProps: VectorFeatureProperties
) => {
    const featureProperties: VectorFeatureProperties = {};
    descriptor.properties.forEach((property) => {
        featureProperties[property.id] = extractVectorFeaturePropertyValue(property, rawFeatureProps);
    });
    return featureProperties;
};
