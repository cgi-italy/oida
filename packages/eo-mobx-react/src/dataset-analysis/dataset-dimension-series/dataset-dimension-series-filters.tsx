import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetDimensionSeries } from '@oida/eo-mobx';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { DatasetDimensionRangeSelector } from '../../dataset-map-viz/dataset-dimension-range-selector';

import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetDimensionSelectorProps = {
    series: DatasetDimensionSeries;
};

const DatasetDimensionSelector = (props: DatasetDimensionSelectorProps) => {

    const value = useSelector(() => {
        return props.series.seriesDimension;
    });

    const dimensions = [...(props.series.config.dimensions || [])];

    if (!dimensions.length) {
        return null;
    }

    const dimensionChoices = dimensions.map((dimension) => {
        return {
            name: dimension.name,
            value: dimension.id
        };
    });

    return (
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
    );
};

type DatasetVariableSelectorProps = {
    series: DatasetDimensionSeries
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


export type DatasetDimensionSeriesFiltersProps = {
    series: DatasetDimensionSeries;
};

export const DatasetDimensionSeriesFilters = (props: DatasetDimensionSeriesFiltersProps) => {


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
            <Form.Item label='Dimension'>
                <DatasetDimensionSelector
                    series={props.series}
                />
            </Form.Item>
            {dimensionRangeField}
            {dimensionValueSelectors}
            <Form.Item label='Variable'>
                <DatasetVariableSeletor
                    series={props.series}
                />
            </Form.Item>
            <Form.Item label='Area'>
                <AnalysisAoiFilter
                    analysis={props.series}
                    supportedGeometries={props.series.config.supportedGeometries}
                />
            </Form.Item>
        </React.Fragment>
    );

};
