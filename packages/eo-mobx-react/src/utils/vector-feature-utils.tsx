import React from 'react';

import { formatDate, formatNumber } from '@oidajs/core';
import { FeaturePropertyValueType, VectorFeaturePropertyDescriptor, VectorFeaturePropertyFormatter } from '@oidajs/eo-mobx';

// extend the formatter output types to support jsx
declare module '@oidajs/eo-mobx' {
    export interface VectorFeaturePropertyFormatterOutputTypes {
        jsx: JSX.Element;
    }
}

/** A default property formatter function */
const formatVectorFeaturePropertyValue = (property: VectorFeaturePropertyDescriptor, value: FeaturePropertyValueType, idx?: number) => {
    if (value === undefined || value === null) {
        return 'N/A';
    }
    if (property.type === 'number' && typeof value === 'number') {
        return formatNumber(value, {
            precision: 3,
            maxLength: 8
        });
    } else if (property.type === 'date') {
        return formatDate(value as moment.MomentInput, {
            format: property.outputStringFormat || 'YYYY-MM-DD HH:mm'
        });
    } else if (property.type === 'enum') {
        const option = property.options.find((option) => option.value === value);
        if (option) {
            return option.name;
        } else {
            return value.toString();
        }
    } else if (property.type === 'string' && typeof value === 'string') {
        const key = idx !== undefined ? `${property.id}_${idx}` : undefined;
        if (property.subType === 'imageUrl') {
            return <img src={value} key={key} />;
        } else if (property.subType === 'url' || /[a-zA-Z]+:\/\//.test(value)) {
            return (
                <a href={value} key={key} target='_blank'>
                    {value}
                </a>
            );
        } else {
            return value as string;
        }
    } else if (property.type === 'composite') {
        return `(${property.properties
            .map((property) => {
                return `${property.name}: ${formatVectorFeaturePropertyValue(property, value[property.id])}`;
            })
            .join(', ')})`;
    } else {
        return value.toString();
    }
};

export const formatVectorFeatureProperty = (
    property: VectorFeaturePropertyDescriptor,
    propertyValue: FeaturePropertyValueType | FeaturePropertyValueType[]
) => {
    if (propertyValue !== undefined) {
        let formattedValue: string | JSX.Element | JSX.Element[] | undefined;
        const formatter: VectorFeaturePropertyFormatter =
            (property.formatter as VectorFeaturePropertyFormatter) || formatVectorFeaturePropertyValue.bind(undefined, property);

        // If the property is an array call the formatter function for each item
        if (property.isArray && Array.isArray(propertyValue)) {
            const items = propertyValue.map((item, idx) => formatter(item, idx));
            if (items.length) {
                // by default display an array as a comma separated string list, unless the formatter returns a JSX element
                if (typeof items[0] === 'string') {
                    formattedValue = (items as string[]).join(', ');
                } else if (items[0] !== undefined) {
                    // the assumption is that we have a jsx element array here.
                    formattedValue = items as JSX.Element[];
                }
            }
        } else if (!Array.isArray(propertyValue)) {
            formattedValue = formatter(propertyValue);
        }

        return formattedValue;
    }
};

export const exportVectorFeaturePropertyValue = (
    property: VectorFeaturePropertyDescriptor,
    value: FeaturePropertyValueType,
    idx?: number
) => {
    if (value === undefined) {
        return '';
    } else if (property.type === 'composite') {
        return `(${property.properties
            .map((property) => {
                return `${property.name}: ${exportVectorFeaturePropertyValue(property, value[property.id])}`;
            })
            .join(', ')})`;
    } else if (property.type === 'date') {
        return formatDate(value as moment.MomentInput, {
            format: 'YYYY-MM-DD[T]HH:mm:ss[Z]'
        });
    } else {
        return `${value}`;
    }
};

export const exportVectorFeatureProperty = (
    property: VectorFeaturePropertyDescriptor,
    propertyValue: FeaturePropertyValueType | FeaturePropertyValueType[]
) => {
    if (propertyValue !== undefined) {
        if (Array.isArray(propertyValue)) {
            return propertyValue
                .map((v) => {
                    return exportVectorFeaturePropertyValue(property, v);
                })
                .join(', ');
        } else {
            return exportVectorFeaturePropertyValue(property, propertyValue);
        }
    } else {
        return '';
    }
};
