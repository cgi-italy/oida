import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetTransectSeries } from '@oida/eo-mobx';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';


type DatasetVariableSelectorProps = {
    series: DatasetTransectSeries
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
    let variableValue = useSelector(() => props.series.seriesVariable);

    let variableFieldConfig = {
        choices: props.series.config.variables.map((variable) => {
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
                props.series.setVariable(value as string);
            }}
        />
    );
};


export type DatasetTransectSeriesFiltersProps = {
    series: DatasetTransectSeries;
};

export const DatasetTransectSeriesFilters = (props: DatasetTransectSeriesFiltersProps) => {

    let dimensionValueSelectors: JSX.Element[] | undefined;

    let dimensions = props.series.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions
        .map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.series.dimensions}
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
                    series={props.series}
                />
            </Form.Item>
            <Form.Item label='Area'>
                <AnalysisAoiFilter
                    analysis={props.series}
                    supportedGeometries={[{
                        type: 'LineString',
                        constraints: {
                            maxCoords: props.series.config.maxLineStringLength
                        }
                    }]}
                />
            </Form.Item>
        </React.Fragment>
    );

};
