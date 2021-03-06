import React from 'react';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';

import { BOOLEAN_FIELD_ID, DATE_RANGE_FIELD_ID, ENUM_FIELD_ID, NUMERIC_RANGE_FIELD_ID, STRING_FIELD_ID } from '@oidajs/core';
import { InputFieldRenderer, NumericRangeFieldRenderer, SelectEnumRenderer } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetVectorMapViz, VectorFeaturePropertyDescriptor } from '@oidajs/eo-mobx';

export type FeaturePropertySelectorProps = {
    featureProperties: VectorFeaturePropertyDescriptor[];
    value: string;
    onChange: (string: string) => void;
};

export const FeaturePropertySelector = (props: FeaturePropertySelectorProps) => {
    const choices = props.featureProperties.map((featureProperty) => {
        let name = featureProperty.name;
        if (featureProperty.units) {
            name += ` (${featureProperty.units})`;
        }
        return {
            name: name,
            value: featureProperty.id,
            description: featureProperty.description
        };
    });

    return (
        <SelectEnumRenderer
            config={{
                choices: choices
            }}
            required={true}
            value={props.value}
            onChange={(value) => props.onChange(value as string)}
        />
    );
};

export type DatasetVectorVizFiltersProps = {
    dataset: DatasetVectorMapViz;
};

export const DatasetVectorVizFilters = (props: DatasetVectorVizFiltersProps) => {
    const propertyFilters = useSelector(() => new Map(props.dataset.propertyFilters.items));
    const filterableProperties = useSelector(() => props.dataset.featureDescriptor?.properties.filter((property) => property.filterable));

    if (!filterableProperties || !filterableProperties.length) {
        return null;
    }

    const missingFilters = filterableProperties.filter((property) => !propertyFilters.has(property.id));

    // initialize a dataset filter based on the feature property descriptor
    const initPropertyFilter = (property: VectorFeaturePropertyDescriptor) => {
        if (property.type === 'number') {
            props.dataset.propertyFilters.set(
                property.id,
                {
                    from: property.domain?.min,
                    to: property.domain?.max
                },
                NUMERIC_RANGE_FIELD_ID
            );
        } else if (property.type === 'enum') {
            props.dataset.propertyFilters.set(property.id, property.options[0].value, ENUM_FIELD_ID);
        } else if (property.type === 'boolean') {
            props.dataset.propertyFilters.set(property.id, true, BOOLEAN_FIELD_ID);
        } else if (property.type === 'date') {
            props.dataset.propertyFilters.set(
                property.id,
                {
                    start: property.domain?.min,
                    end: property.domain?.max
                },
                DATE_RANGE_FIELD_ID
            );
        } else {
            props.dataset.propertyFilters.set(property.id, undefined, STRING_FIELD_ID);
        }
    };

    const filters = Array.from(propertyFilters.values()).map((filter) => {
        const featureProperty = filterableProperties.find((property) => property.id === filter.key);
        if (!featureProperty) {
            return null;
        }

        let filterElement: JSX.Element | undefined;

        if (featureProperty.type === 'number') {
            filterElement = (
                <NumericRangeFieldRenderer
                    config={{
                        min: featureProperty.domain?.min,
                        max: featureProperty.domain?.max
                    }}
                    value={filter.value}
                    onChange={(value) => {
                        if (value) {
                            props.dataset.propertyFilters.set(featureProperty.id, value, NUMERIC_RANGE_FIELD_ID);
                        } else {
                            props.dataset.propertyFilters.unset(featureProperty.id);
                        }
                    }}
                    title={featureProperty.name}
                />
            );
        } else if (featureProperty.type === 'string') {
            filterElement = (
                <InputFieldRenderer
                    config={{}}
                    value={filter.value}
                    onChange={(value) => {
                        props.dataset.propertyFilters.set(featureProperty.id, value || '', STRING_FIELD_ID);
                    }}
                    title={featureProperty.name}
                />
            );
        } else if (featureProperty.type === 'enum') {
            filterElement = (
                <SelectEnumRenderer
                    config={{
                        choices: featureProperty.options.map((option) => {
                            return {
                                name: option.name,
                                value: option.value.toString()
                            };
                        })
                    }}
                    value={filter.value}
                    required={true}
                    onChange={(value) => {
                        props.dataset.propertyFilters.set(featureProperty.id, value, ENUM_FIELD_ID);
                    }}
                />
            );
        }
        //TODO: add filters for other feature property types

        return (
            <div key={featureProperty.id} className='dataset-vector-viz-filter'>
                <div className='dataset-vector-viz-filter-property'>
                    <FeaturePropertySelector
                        featureProperties={[featureProperty, ...missingFilters]}
                        value={featureProperty.id}
                        onChange={(value) => {
                            const newProperty = filterableProperties.find((property) => property.id === value);
                            if (newProperty) {
                                props.dataset.propertyFilters.unset(featureProperty.id);
                                initPropertyFilter(newProperty);
                            }
                        }}
                    />
                    <Tooltip title='Remove filter'>
                        <Button type='primary' size='small' onClick={() => props.dataset.propertyFilters.unset(featureProperty.id)}>
                            <DeleteOutlined />
                        </Button>
                    </Tooltip>
                </div>
                <div className='dataset-vector-viz-filter-control'>{filterElement}</div>
            </div>
        );
    });

    const filterDropdownItems = missingFilters.map((filter) => {
        return (
            <Menu.Item key={filter.id} onClick={() => initPropertyFilter(filter)}>
                {filter.name}
            </Menu.Item>
        );
    });

    return (
        <div className='dataset-vector-viz-filters'>
            <div className='dataset-vector-viz-filter-header'>
                <span>Data filters:</span>
                <Tooltip title='Add filter'>
                    <Dropdown overlay={<Menu>{filterDropdownItems}</Menu>} trigger={['click']} disabled={!missingFilters.length}>
                        <Button type='primary' size='small'>
                            <PlusOutlined />
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                </Tooltip>
            </div>
            {filters}
        </div>
    );
};
