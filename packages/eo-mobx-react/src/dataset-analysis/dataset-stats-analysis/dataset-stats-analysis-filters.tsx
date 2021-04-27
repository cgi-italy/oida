import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetStatsAnalysis } from '@oida/eo-mobx';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';


type DatasetVariableSelectorProps = {
    stats: DatasetStatsAnalysis;
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
    let variableValue = useSelector(() => props.stats.variable);

    let variableFieldConfig = {
        choices: props.stats.config.variables.map((variable) => {
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
                props.stats.setVariable(value as string);
            }}
        />
    );
};


export type DatasetStatsAnalysisFiltersProps = {
    stats: DatasetStatsAnalysis;
};

export const DatasetStatsAnalysisFilters = (props: DatasetStatsAnalysisFiltersProps) => {

    let dimensionValueSelectors: JSX.Element[] | undefined;

    let dimensions = props.stats.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions
        .map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.stats.dimensions}
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
                    stats={props.stats}
                />
            </Form.Item>
            <Form.Item label='Area'>
                <AnalysisAoiFilter
                    analysis={props.stats}
                    supportedGeometries={[{
                        type: 'BBox'
                    }, {
                        type: 'Polygon',
                    }]}
                />
            </Form.Item>
        </React.Fragment>
    );
};
