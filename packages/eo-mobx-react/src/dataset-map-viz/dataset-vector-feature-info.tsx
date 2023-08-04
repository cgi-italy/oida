import React, { useState } from 'react';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Tooltip, Table } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import moment from 'moment';
import download from 'downloadjs';
import useDimensions from 'react-cool-dimensions';

import { formatDate, formatNumber } from '@oidajs/core';
import {
    createPropertiesDescriptorFromFeature,
    createPropertiesDescriptorFromFeatures,
    DatasetVectorFeature,
    DatasetVectorMapViz,
    FeaturePropertyValueType,
    VectorFeatureDescriptor,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor,
    VectorFeaturePropertyFormatter,
    VECTOR_VIZ_TYPE
} from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetAnalysisWidgetFactory } from '../dataset-analysis';

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

const formatVectorFeatureProperty = (
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

const exportVectorFeaturePropertyValue = (property: VectorFeaturePropertyDescriptor, value: FeaturePropertyValueType, idx?: number) => {
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

const exportVectorFeatureProperty = (
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

    let featureProperties = props.featureDescriptor?.properties || [];
    if (!featureProperties.length) {
        // create a default descriptor based on the feature content
        featureProperties = createPropertiesDescriptorFromFeature(props.vectorFeature.properties);
    }

    featureProperties.forEach((property) => {
        const formattedValue = formatVectorFeatureProperty(property, props.vectorFeature.properties[property.id]);

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
    });

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

export type DatasetVectorFeatureTableInfoProps<T extends VectorFeatureProperties = VectorFeatureProperties> = {
    /** The vector feature */
    vectorFeature: DatasetVectorFeature<T>[];
    /** The feature schema */
    featureDescriptor?: VectorFeatureDescriptor;
};

export const DatasetVectorFeatureInfoTable = <T extends VectorFeatureProperties = VectorFeatureProperties>(
    props: DatasetVectorFeatureTableInfoProps<T>
) => {
    const { observe, height } = useDimensions();

    let featureProperties: VectorFeaturePropertyDescriptor[] = props.featureDescriptor?.properties || [];
    if (!featureProperties.length) {
        if (props.vectorFeature.length) {
            // create a default descriptor based on the input features
            featureProperties = createPropertiesDescriptorFromFeatures(props.vectorFeature.map((feature) => feature.properties));
        }
    }

    const columns: ColumnType<T>[] = featureProperties.map((property) => {
        return {
            title: property.name,
            dataIndex: property.id,
            key: property.id,
            ellipsis: true,
            sorter: property.sortable
                ? (a, b, order) => {
                      const firstValue = a[property.id];
                      const secondValue = b[property.id];

                      if (firstValue === secondValue) {
                          return 0;
                      } else if (firstValue === undefined) {
                          return order === 'ascend' ? 1 : -1;
                      } else if (secondValue === undefined) {
                          return order === 'ascend' ? -1 : 1;
                      } else {
                          return firstValue > secondValue ? 1 : -1;
                      }
                  }
                : undefined,
            render: (value) => {
                const formattedValue = formatVectorFeatureProperty(property, value);
                return <span className='table-cell-content'>{formattedValue}</span>;
            }
        };
    });

    const data = props.vectorFeature.map((feature, idx) => {
        return {
            ...feature.properties,
            key: idx
        };
    });

    const exportFunction = () => {
        let csvData = columns
            .map((column) => {
                return column.title;
            })
            .toString()
            .concat('\n');

        const csvLines = data
            .map((item) => {
                return featureProperties
                    .map((property) => {
                        return `"${exportVectorFeatureProperty(property, item[property.id])}"`;
                    })
                    .join(',');
            })
            .join('\n');
        csvData += csvLines;
        download(csvData, 'selectedData.csv', 'text/csv');
    };

    const [pageSize, setPageSize] = useState(20);

    return (
        <div className='dataset-vector-feature-info-table'>
            <div className='table-controls'>
                <span className='table-items-info'>{data.length} items selected</span>
                <Button size='small' type='primary' onClick={() => exportFunction()} icon={<DownloadOutlined />}>
                    Export as CSV
                </Button>
            </div>
            <div className='table-content' ref={observe}>
                <Table
                    size='small'
                    columns={columns}
                    dataSource={data}
                    tableLayout='auto'
                    scroll={{ y: height - (data.length > pageSize ? 75 : 40) }}
                    pagination={{ hideOnSinglePage: true, pageSize: pageSize, onChange: (_page, pageSize) => setPageSize(pageSize) }}
                    expandable={{
                        expandedRowRender: (record) => {
                            return (
                                <DatasetVectorFeatureInfo
                                    vectorFeature={props.vectorFeature[record.key as number]}
                                    featureDescriptor={props.featureDescriptor}
                                />
                            );
                        }
                    }}
                />
            </div>
        </div>
    );
};

export type DatasetVectorMapVizWidgetProps = {
    vectorMapViz: DatasetVectorMapViz;
};

/**
 * The widget for a {@link DatasetVectorMapViz}. It displays the information about the selected feature
 */
export const DatasetVectorMapVizWidget = (props: DatasetVectorMapVizWidgetProps) => {
    const selectedFeatures = useSelector(() => props.vectorMapViz.selectedFeatures);
    const featureDescriptor = useSelector(() => props.vectorMapViz.featureDescriptor);
    if (!selectedFeatures.length) {
        return null;
    } else if (selectedFeatures.length === 1) {
        return <DatasetVectorFeatureInfo vectorFeature={selectedFeatures[0]} featureDescriptor={featureDescriptor} />;
    } else {
        return <DatasetVectorFeatureInfoTable vectorFeature={selectedFeatures} featureDescriptor={featureDescriptor} />;
    }
};

DatasetAnalysisWidgetFactory.register(VECTOR_VIZ_TYPE, (config) => {
    const vectorViz = config.mapViz as DatasetVectorMapViz;

    return <DatasetVectorMapVizWidget vectorMapViz={vectorViz} />;
});
