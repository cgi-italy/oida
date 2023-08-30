import moment from 'moment';

import {
    COMPOSITE_FEATURE_PROPERTY_TYPE,
    DATE_FEATURE_PROPERTY_TYPE,
    FeaturePropertyValueType,
    NUMERIC_FEATURE_PROPERTY_TYPE,
    VectorFeatureDescriptor,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor
} from '../dataset-map-viz/vector-feature-descriptor';

/**
 * Parse a property value given its descriptor and the feature property raw value.
 * Use the {@link VectorFeaturePropertyDescriptor.parser} when defined
 *
 * @param property The feature property descriptor
 * @param rawValue The feature property raw value
 * @returns The parsed feature property value
 */
export const parseFeaturePropertyValue = (
    property: VectorFeaturePropertyDescriptor,
    rawValue: FeaturePropertyValueType | FeaturePropertyValueType[]
): FeaturePropertyValueType | FeaturePropertyValueType[] => {
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        if (property.parser) {
            try {
                return property.parser(rawValue);
            } catch (e) {
                return undefined;
            }
        } else if (property.isArray) {
            let arrayValues: FeaturePropertyValueType[];
            if (Array.isArray(rawValue)) {
                arrayValues = rawValue;
            } else if (typeof rawValue === 'string') {
                arrayValues = rawValue.split(',');
            } else {
                return undefined;
            }
            return arrayValues
                .map((value) => {
                    return parseFeaturePropertyValue(
                        {
                            ...property,
                            isArray: false
                        },
                        value
                    ) as FeaturePropertyValueType;
                })
                .filter((value) => value !== undefined);
        } else if (property.type === DATE_FEATURE_PROPERTY_TYPE && !(rawValue instanceof Date)) {
            if (typeof rawValue === 'string') {
                const dateValue = moment.utc(rawValue, property.inputStringFormat);
                return dateValue.isValid() ? dateValue.toDate() : undefined;
            } else {
                return undefined;
            }
        } else if (property.type === NUMERIC_FEATURE_PROPERTY_TYPE && !(typeof rawValue === 'number')) {
            if (typeof rawValue === 'string') {
                const numericValue = parseFloat(rawValue);
                if (!Number.isFinite(numericValue)) {
                    return undefined;
                } else {
                    return numericValue;
                }
            } else {
                return undefined;
            }
        } else if (property.type === COMPOSITE_FEATURE_PROPERTY_TYPE) {
            let recordValue: Record<string, any>;
            if (typeof rawValue === 'object') {
                recordValue = rawValue;
            } else if (typeof rawValue === 'string') {
                try {
                    recordValue = JSON.parse(rawValue);
                } catch (e) {
                    return undefined;
                }
            } else {
                return undefined;
            }
            const subProperties: VectorFeatureProperties = {};
            property.properties.forEach((subProperty) => {
                subProperties[subProperty.id] = extractVectorFeaturePropertyValue(subProperty, recordValue);
            });
            return subProperties;
        } else {
            return rawValue;
        }
    } else {
        return undefined;
    }
};

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
    try {
        const rawValue = property.valueExtractor ? property.valueExtractor(featureProps) : featureProps[property.id];
        return parseFeaturePropertyValue(property, rawValue);
    } catch (e) {
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
