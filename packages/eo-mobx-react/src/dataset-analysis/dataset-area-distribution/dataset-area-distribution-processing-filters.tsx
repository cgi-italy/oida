import React from 'react';
import { Form } from 'antd';

import { SelectEnumRenderer } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaDistribution } from '@oidajs/eo-mobx';

import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetVariableSelectorProps = {
    processing: DatasetAreaDistribution;
};

const DatasetVariableSelector = (props: DatasetVariableSelectorProps) => {
    const variableValue = useSelector(() => props.processing.variable);

    const variableFieldConfig = {
        choices: props.processing.config.variables.map((variable) => {
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

export type DatasetAreaDistributionProcessingFiltersProps = {
    processing: DatasetAreaDistribution;
};

export const DatasetAreaDistributionProcessingFilters = (props: DatasetAreaDistributionProcessingFiltersProps) => {
    return (
        <React.Fragment>
            <Form.Item label='Variable'>
                <DatasetVariableSelector processing={props.processing} />
            </Form.Item>
            <Form.Item label='Area'>
                <AnalysisAoiFilter analysis={props.processing} supportedGeometries={props.processing.config.supportedGeometries} />
            </Form.Item>
        </React.Fragment>
    );
};
