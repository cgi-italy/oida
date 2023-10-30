import { IFormFieldDefinition } from '@oidajs/core';
import {
    BOOLEAN_FEATURE_PROPERTY_TYPE,
    DATE_FEATURE_PROPERTY_TYPE,
    ENUM_FEATURE_PROPERTY_TYPE,
    NUMERIC_FEATURE_PROPERTY_TYPE,
    STRING_FEATURE_PROPERTY_TYPE,
    VectorFeatureDescriptor
} from '../dataset-map-viz';

export const getFormFieldsForVectorDescriptor = (featureDescriptor: VectorFeatureDescriptor) => {
    const filterableProperties = featureDescriptor.properties.filter((property) => property.filterable);
    const filters: IFormFieldDefinition[] = filterableProperties.map((property) => {
        const baseDefinition = {
            name: property.id,
            description: property.description,
            title: property.name
        };

        let fieldDefinition: IFormFieldDefinition;

        if (property.type === ENUM_FEATURE_PROPERTY_TYPE) {
            fieldDefinition = {
                ...baseDefinition,
                type: 'enum',
                config: {
                    choices: property.options.map((option) => {
                        return {
                            name: option.name,
                            value: option.value.toString(),
                            description: option.description
                        };
                    })
                }
            };
        } else if (property.type === BOOLEAN_FEATURE_PROPERTY_TYPE) {
            fieldDefinition = {
                ...baseDefinition,
                type: 'boolean',
                config: {}
            };
        } else if (property.type === STRING_FEATURE_PROPERTY_TYPE) {
            fieldDefinition = {
                ...baseDefinition,
                type: 'string',
                config: {}
            };
        } else if (property.type === DATE_FEATURE_PROPERTY_TYPE) {
            fieldDefinition = {
                ...baseDefinition,
                type: 'daterange',
                config: {
                    minDate: property.domain?.min,
                    maxDate: property.domain?.max
                }
            };
        } else if (property.type === NUMERIC_FEATURE_PROPERTY_TYPE) {
            fieldDefinition = {
                ...baseDefinition,
                type: 'numericrange',
                config: {
                    min: property.domain?.min,
                    max: property.domain?.max
                }
            };
        } else {
            throw new Error(`getFormFieldsForVectorDescriptor: Unable to create a form field for property of type ${property.type}`);
        }
        return fieldDefinition;
    });

    return filters;
};
