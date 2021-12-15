import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetPointSeries } from '@oidajs/eo-mobx';
import { SelectEnumRenderer } from '@oidajs/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { DatasetDimensionRangeSelector } from '../../dataset-map-viz/dataset-dimension-range-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetDimensionSelectorProps = {
    series: DatasetPointSeries;
};

const DatasetDimensionSelector = (props: DatasetDimensionSelectorProps) => {

    const value = useSelector(() => {
        return props.series.seriesDimension;
    });

    const dimensions = [...(props.series.config.dimensions.filter(dimension => !dimension.preventSeries) || [])];

    if (!dimensions.length) {
        return null;
    }

    if (dimensions.length === 1) {
        if (!value) {
            props.series.setDimension(dimensions[0].id);
        }
        return null;
    }

    const dimensionChoices = dimensions.map((dimension) => {
        return {
            name: dimension.name,
            value: dimension.id
        };
    });

    return (
        <Form.Item label='Dimension'>
            <SelectEnumRenderer
                config={{
                    choices: dimensionChoices
                }}
                value={value}
                placeholder='Select dimension'
                required={true}
                onChange={(value) => {
                    props.series.setDimension(value as string);
                }}
            />
        </Form.Item>
    );
};

type DatasetVariableSelectorProps = {
    series: DatasetPointSeries
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

    if (!variableFieldConfig.choices.length) {
        return null;
    } else if (variableFieldConfig.choices.length === 1) {
        if (!variableValue) {
            props.series.setVariable(variableFieldConfig.choices[0].value);
        }
        return null;
    }

    return (
        <Form.Item label='Variable'>
            <SelectEnumRenderer
                config={variableFieldConfig}
                value={variableValue}
                placeholder='Select variable'
                required={true}
                onChange={(value) => {
                    props.series.setVariable(value as string);
                }}
            />
        </Form.Item>
    );
};


export type DatasetPointSeriesFiltersProps = {
    series: DatasetPointSeries;
};

export const DatasetPointSeriesFilters = (props: DatasetPointSeriesFiltersProps) => {


    let dimensionValueSelectors: JSX.Element[] | undefined;

    const selectedDimension = useSelector(() => {
        return props.series.seriesDimension;
    });

    const selectedRange = useSelector(() => {
        return props.series.seriesRange;
    });

    let dimensions = props.series.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions
        .filter(
            dimension => dimension.id !== selectedDimension
        ).map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.series.dimensions}
                        dimension={dimension}
                        timeDistributionProvider={props.series.dataset.config.timeDistribution?.provider}
                    />
                </Form.Item>
            );
        });
    }

    let dimensionRangeField: JSX.Element | undefined;
    const dimension = dimensions?.find(dimension => dimension.id === selectedDimension);

    if (dimension) {
        dimensionRangeField = (
            <DatasetDimensionRangeSelector
                dimension={dimension}
                value={selectedRange}
                onChange={(value) => props.series.setRange(value)}
            />
        );
    }

    return (
        <React.Fragment>
            <DatasetDimensionSelector
                series={props.series}
            />
            {dimensionRangeField}
            {dimensionValueSelectors}
            <DatasetVariableSeletor
                series={props.series}
            />
            <Form.Item label='Location'>
                <AnalysisAoiFilter
                    analysis={props.series}
                    supportedGeometries={[{type: 'Point'}]}
                />
            </Form.Item>
        </React.Fragment>
    );

};
