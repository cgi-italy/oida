import React from 'react';
import { Form } from 'antd';

import { capitalizeString } from '@oidajs/core';
import { SelectEnumRenderer } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';
import {
    DatasetAreaDistribution,
    DatasetAreaDistributionAggregationMethod,
    DatasetAreaDistributionMeasureType,
    DatasetAreaDistributionMode,
    ENUM_FEATURE_PROPERTY_TYPE,
    NUMERIC_FEATURE_PROPERTY_TYPE
} from '@oidajs/eo-mobx';

import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetVariableSelectorProps = {
    processing: DatasetAreaDistribution;
};

const DatasetVariableSelector = (props: DatasetVariableSelectorProps) => {
    const variableValue = useSelector(() => props.processing.variable);

    const availableModes = props.processing.getAvailableModes();

    const variableFieldConfig = {
        choices: props.processing.config.variables
            .filter((variable) => {
                if (
                    !availableModes[DatasetAreaDistributionMode.EnumCount] &&
                    !availableModes[DatasetAreaDistributionMode.EnumGroupByEnum]
                ) {
                    return variable.type !== ENUM_FEATURE_PROPERTY_TYPE;
                } else if (
                    !availableModes[DatasetAreaDistributionMode.NumericGroupByEnum] &&
                    !availableModes[DatasetAreaDistributionMode.NumericStats]
                ) {
                    return variable.type !== NUMERIC_FEATURE_PROPERTY_TYPE;
                } else {
                    return true;
                }
            })
            .map((variable) => {
                return {
                    value: variable.id,
                    name: variable.name
                };
            })
    };

    return (
        <SelectEnumRenderer
            config={variableFieldConfig}
            value={variableValue}
            placeholder='Select variable'
            required={true}
            onChange={(value) => {
                props.processing.setVariable(value as string);
            }}
        />
    );
};

const DatasetGroupByVariableSelector = (props: DatasetVariableSelectorProps) => {
    const selectedVariable = useSelector(() => {
        return props.processing.variable;
    });

    const groupByVariable = useSelector(() => {
        return props.processing.groupByVariable;
    });

    const variableFieldConfig = {
        choices: selectedVariable
            ? props.processing.config.variables
                  .filter((variable) => {
                      return variable.id !== selectedVariable && variable.type === ENUM_FEATURE_PROPERTY_TYPE;
                  })
                  .map((variable) => {
                      return {
                          value: variable.id,
                          name: variable.name
                      };
                  })
            : []
    };

    return (
        <SelectEnumRenderer
            config={variableFieldConfig}
            value={groupByVariable}
            placeholder='None'
            required={false}
            onChange={(value) => {
                props.processing.setGroupByVariable(value as string);
            }}
        />
    );
};

const DatasetAggregationMethodSelector = (props: DatasetVariableSelectorProps) => {
    const aggregationMethod = useSelector(() => props.processing.aggregationMethod);

    const choices = props.processing.config.supportedAggregationMethods.map((method) => {
        return {
            name: capitalizeString(method),
            value: method
        };
    });

    return (
        <SelectEnumRenderer
            value={aggregationMethod}
            onChange={(value) => props.processing.setAggregatioNMethod(value as DatasetAreaDistributionAggregationMethod)}
            required={true}
            config={{
                choices: choices
            }}
        />
    );
};

const DatasetMeasureTypeSelector = (props: DatasetVariableSelectorProps) => {
    const measureType = useSelector(() => props.processing.measureType);

    const choices = props.processing.config.supportedMeasureTypes.map((type) => {
        return {
            name: capitalizeString(type),
            value: type
        };
    });

    return (
        <SelectEnumRenderer
            value={measureType}
            onChange={(value) => props.processing.setMeasureType(value as DatasetAreaDistributionMeasureType)}
            required={true}
            config={{
                choices: choices
            }}
        />
    );
};

export type DatasetAreaDistributionProcessingFiltersProps = {
    processing: DatasetAreaDistribution;
};

export const DatasetAreaDistributionProcessingFilters = (props: DatasetAreaDistributionProcessingFiltersProps) => {
    const selectedVariableConfig = useSelector(() => props.processing.variableDescriptor);

    const availableModes = props.processing.getAvailableModes();

    const currentMode = useSelector(() => props.processing.currentMode);

    const showGroupBySelector =
        (selectedVariableConfig?.type === NUMERIC_FEATURE_PROPERTY_TYPE &&
            availableModes[DatasetAreaDistributionMode.NumericGroupByEnum]) ||
        (selectedVariableConfig?.type === ENUM_FEATURE_PROPERTY_TYPE && availableModes[DatasetAreaDistributionMode.EnumGroupByEnum]);

    return (
        <React.Fragment>
            <Form.Item label='Variable'>
                <DatasetVariableSelector processing={props.processing} />
            </Form.Item>
            {showGroupBySelector && (
                <Form.Item label='Group by'>
                    <DatasetGroupByVariableSelector processing={props.processing} />
                </Form.Item>
            )}
            {currentMode === DatasetAreaDistributionMode.NumericGroupByEnum && (
                <Form.Item label='Aggregation method'>
                    <DatasetAggregationMethodSelector processing={props.processing} />
                </Form.Item>
            )}
            {currentMode === DatasetAreaDistributionMode.EnumCount && props.processing.config.supportedMeasureTypes.length > 1 && (
                <Form.Item label='Measure mode'>
                    <DatasetMeasureTypeSelector processing={props.processing} />
                </Form.Item>
            )}
            <Form.Item label='Area'>
                <AnalysisAoiFilter analysis={props.processing} supportedGeometries={props.processing.config.supportedGeometries} />
            </Form.Item>
        </React.Fragment>
    );
};
