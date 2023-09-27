import React, { useState } from 'react';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Tooltip, Table } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import download from 'downloadjs';
import useDimensions from 'react-cool-dimensions';

import {
    createPropertiesDescriptorFromFeature,
    createPropertiesDescriptorFromFeatures,
    DatasetVectorFeature,
    DatasetVectorMapViz,
    VectorFeatureDescriptor,
    VectorFeatureProperties,
    VectorFeaturePropertyDescriptor,
    VECTOR_VIZ_TYPE
} from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetAnalysisWidgetFactory } from '../dataset-analysis';
import { exportVectorFeatureProperty, formatVectorFeatureProperty } from '../utils';

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
            sorter: (a, b, order) => {
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
            },
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
