import React from 'react';
import { Descriptions, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { formatDate, formatNumber } from '@oidajs/core';
import { useSelector } from '@oidajs/ui-react-mobx';
import {
    DatasetVectorFeature,
    DatasetVectorMapViz,
    FeaturePropertyValueType,
    VectorFeatureDescriptor,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor,
    VectorFeaturePropertyFormatter,
    VECTOR_VIZ_TYPE
} from '@oidajs/eo-mobx';

import { DatasetAnalysisWidgetFactory } from '../dataset-analysis';

// extend the formatter output types to support jsx
declare module '@oidajs/eo-mobx' {
    export interface VectorFeaturePropertyFormatterOutputTypes {
        jsx: JSX.Element;
    }
}

/** A default property formatter function */
const formatVectorFeaturePropertyValue = (property: VectorFeaturePropertyDescriptor, value: FeaturePropertyValueType, idx?: number) => {
    if (value === undefined) {
        return 'N/A';
    }
    if (property.type === 'number' && typeof value === 'number') {
        return formatNumber(value, {
            precision: 3,
            maxLength: 8
        });
    } else if (property.type === 'date') {
        return formatDate(value as moment.MomentInput, {
            format: 'YYYY-MM-DD HH:mm'
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
        if (property.subType === 'url') {
            return (
                <a href={value} key={key} target='_blank'>
                    {value}
                </a>
            );
        } else if (property.subType === 'imageUrl') {
            return <img src={value} key={key} />;
        } else {
            return value as string;
        }
    } else {
        return value.toString();
    }
};

/** The {@link DatasetVectorFeatureInfo} component properties type*/
export type DatasetVectorFeatureInfoProps<T extends VectorFeatureProperties = VectorFeatureProperties> = {
    /** The vector feature */
    vectorFeature: DatasetVectorFeature<T>;
    /** The feature schema */
    featureDescriptor?: VectorFeatureDescriptor;
};

/**
 * A component that displays information about a {@link DatasetVectorFeature | dataset vector feature}
 */
export const DatasetVectorFeatureInfo = <T extends VectorFeatureProperties = VectorFeatureProperties>(
    props: DatasetVectorFeatureInfoProps<T>
) => {
    const items: JSX.Element[] = [];

    if (props.featureDescriptor) {
        props.featureDescriptor.properties.forEach((property) => {
            const rawValue = property.valueExtractor
                ? property.valueExtractor(props.vectorFeature.properties)
                : props.vectorFeature.properties[property.id];

            if (rawValue !== undefined && rawValue !== '') {
                const value = property.parser ? property.parser(rawValue) : rawValue;
                let formattedValue: string | JSX.Element | JSX.Element[] | undefined;
                const formatter: VectorFeaturePropertyFormatter =
                    (property.formatter as VectorFeaturePropertyFormatter) || formatVectorFeaturePropertyValue.bind(undefined, property);

                // If the property is an array call the formatter function for each item
                if (property.isArray && Array.isArray(value)) {
                    const items = value.map((item, idx) => formatter(item, idx));
                    if (items.length) {
                        // by default display an array as a comma separated string list, unless the formatter returns a JSX element
                        if (typeof items[0] === 'string') {
                            formattedValue = (items as string[]).join(', ');
                        } else if (items[0] !== undefined) {
                            // the assumption is that we have a jsx element array here.
                            formattedValue = items as JSX.Element[];
                        }
                    }
                } else if (!Array.isArray(value)) {
                    formattedValue = formatter(value);
                }

                if (formattedValue) {
                    let label: React.ReactNode = property.name;
                    if (property.description) {
                        label = (
                            <div className='dataset-vector-feature-property-label'>
                                <span>{property.name}</span>
                                <Tooltip title={property.description}>
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </div>
                        );
                    }
                    items.push(
                        <Descriptions.Item
                            key={property.id}
                            label={label}
                            className={`dataset-vector-feature-property dataset-vector-feature-property-${property.id}`}
                        >
                            {formattedValue} {property.units}
                        </Descriptions.Item>
                    );
                }
            }
        });
    } else {
        Object.entries(props.vectorFeature.properties).forEach(([key, value]) => {
            items.push(
                <Descriptions.Item key={key} label={key}>
                    {value}
                </Descriptions.Item>
            );
        });
    }

    return (
        <Descriptions
            className='dataset-vector-feature-info'
            title={props.featureDescriptor?.title ? `${props.featureDescriptor?.title}:` : undefined}
            column={1}
            size='small'
        >
            {items}
        </Descriptions>
    );
};

export type DatasetVectorMapVizWidgetProps = {
    vectorMapViz: DatasetVectorMapViz;
};

/**
 * The widget for a {@link DatasetVectorMapViz}. It displays the information about the selected feature
 */
export const DatasetVectorMapVizWidget = (props: DatasetVectorMapVizWidgetProps) => {
    const selectedFeature = useSelector(() => props.vectorMapViz.selectedFeature);
    const featureDescriptor = useSelector(() => props.vectorMapViz.featureDescriptor);
    if (!selectedFeature) {
        return null;
    }

    return <DatasetVectorFeatureInfo vectorFeature={selectedFeature} featureDescriptor={featureDescriptor} />;
};

DatasetAnalysisWidgetFactory.register(VECTOR_VIZ_TYPE, (config) => {
    const vectorViz = config.mapViz as DatasetVectorMapViz;

    return <DatasetVectorMapVizWidget vectorMapViz={vectorViz} />;
});
