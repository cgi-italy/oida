import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetGridValues } from '@oida/eo-mobx';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';


type DatasetVariableSelectorProps = {
    analysis: DatasetGridValues
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
    let variableValue = useSelector(() => props.analysis.variable, [props.analysis]);

    let variableFieldConfig = {
        choices: props.analysis.config.variables.map((variable) => {
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
                props.analysis.setVariable(value as string);
            }}
        />
    );
};


export type DatasetGridValuesFiltersProps = {
    analysis: DatasetGridValues;
    disableAoi?: boolean;
};

export const DatasetGridValuesFilters = (props: DatasetGridValuesFiltersProps) => {

    let dimensionValueSelectors: JSX.Element[] | undefined;

    let dimensions = props.analysis.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions
        .map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.analysis.dimensions}
                        dimension={dimension}
                    />
                </Form.Item>
            );
        });
    }

    return (
        <React.Fragment>
            {dimensionValueSelectors}
            <Form.Item label='Variable'>
                <DatasetVariableSeletor
                    analysis={props.analysis}
                />
            </Form.Item>
            {!props.disableAoi &&
                <Form.Item label='Area'>
                    <AnalysisAoiFilter
                        analysis={props.analysis}
                        supportedGeometries={[{
                            type: 'BBox'
                        }]}
                    />
                </Form.Item>
            }
        </React.Fragment>
    );

};
