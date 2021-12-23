import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaValues } from '@oidajs/eo-mobx';
import { SelectEnumRenderer } from '@oidajs/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetVariableSelectorProps = {
    processing: DatasetAreaValues;
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
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

export type DatasetAreaValuesProcessingFiltersProps = {
    processing: DatasetAreaValues;
    disableAoi?: boolean;
};

export const DatasetAreaValuesProcessingFilters = (props: DatasetAreaValuesProcessingFiltersProps) => {
    let dimensionValueSelectors: JSX.Element[] | undefined;

    const dimensions = props.processing.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions.map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.processing.dimensions}
                        dimension={dimension}
                        timeDistributionProvider={props.processing.dataset.config.timeDistribution?.provider}
                    />
                </Form.Item>
            );
        });
    }

    return (
        <React.Fragment>
            {dimensionValueSelectors}
            <Form.Item label='Variable'>
                <DatasetVariableSeletor processing={props.processing} />
            </Form.Item>
            {!props.disableAoi && (
                <Form.Item label='Area'>
                    <AnalysisAoiFilter analysis={props.processing} supportedGeometries={props.processing.config.supportedGeometries} />
                </Form.Item>
            )}
        </React.Fragment>
    );
};
