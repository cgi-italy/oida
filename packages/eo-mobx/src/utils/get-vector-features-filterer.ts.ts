import moment from 'moment';

import { DATE_RANGE_FIELD_ID, ENUM_FIELD_ID, NUMERIC_RANGE_FIELD_ID, QueryFilter, STRING_FIELD_ID } from '@oidajs/core';
import {
    DatasetVectorFeatureProps,
    VectorFeatureDescriptor,
    FeaturePropertyValueTypes,
    VectorFeaturePropertyDescriptor,
    ENUM_FEATURE_PROPERTY_TYPE,
    NUMERIC_FEATURE_PROPERTY_TYPE,
    STRING_FEATURE_PROPERTY_TYPE,
    DATE_FEATURE_PROPERTY_TYPE
} from '../dataset-map-viz';

/**
 * A factory function that given a feature descriptor returns a function to filter a feature array (matching the
 * provided schema) with a set of query filters.
 *
 * @param featureDescriptor The feature schema
 * @returns An in memory filterer of a feature array
 */
export const getVectorFeaturesFilterer = (featureDescriptor: VectorFeatureDescriptor) => {
    const propertiesMap: Record<string, VectorFeaturePropertyDescriptor> = featureDescriptor.properties.reduce((propsMap, property) => {
        return {
            ...propsMap,
            [property.id]: property
        };
    }, {});

    return (features: DatasetVectorFeatureProps[], filters: QueryFilter[]) => {
        return features.filter((feature) => {
            let filtered = false;
            for (const filter of filters) {
                const featureProperty = propertiesMap[filter.key];
                if (featureProperty) {
                    if (featureProperty.type === NUMERIC_FEATURE_PROPERTY_TYPE && filter.type === NUMERIC_RANGE_FIELD_ID) {
                        const value = feature.properties[filter.key] as FeaturePropertyValueTypes[typeof NUMERIC_FEATURE_PROPERTY_TYPE];
                        if (value < filter.value.from || value > filter.value.to) {
                            filtered = true;
                            break;
                        }
                    } else if (featureProperty.type === ENUM_FEATURE_PROPERTY_TYPE && filter.type === ENUM_FIELD_ID) {
                        const value = feature.properties[filter.key] as FeaturePropertyValueTypes[typeof ENUM_FEATURE_PROPERTY_TYPE];
                        if (Array.isArray(filter.value)) {
                            if (!filter.value.find((v) => v === value)) {
                                filtered = true;
                                break;
                            }
                        } else {
                            if (filter.value !== value) {
                                filtered = true;
                                break;
                            }
                        }
                    } else if (featureProperty.type === STRING_FEATURE_PROPERTY_TYPE && filter.type === STRING_FIELD_ID) {
                        const value = feature.properties[filter.key] as FeaturePropertyValueTypes[typeof STRING_FEATURE_PROPERTY_TYPE];
                        if (filter.value && value.toLowerCase().search(filter.value.toLowerCase()) === -1) {
                            filtered = true;
                            break;
                        }
                    } else if (featureProperty.type === DATE_FEATURE_PROPERTY_TYPE && filter.type === DATE_RANGE_FIELD_ID) {
                        const value = feature.properties[filter.key] as FeaturePropertyValueTypes[typeof DATE_FEATURE_PROPERTY_TYPE];
                        if (moment.utc(value) > filter.value.end || moment.utc(value) < filter.value.start) {
                            filtered = true;
                            break;
                        }
                    }
                }
            }
            return !filtered;
        });
    };
};
