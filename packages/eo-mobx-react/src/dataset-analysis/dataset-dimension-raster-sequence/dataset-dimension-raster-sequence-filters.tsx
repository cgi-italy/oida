import React from 'react';
import { Form } from 'antd';

import { useFormData, useSelector } from '@oida/ui-react-mobx';
import { DatasetDimensionRasterSequence } from '@oida/eo-mobx';
import { DataFormItems, SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { DatasetDimensionRangeSelector } from '../../dataset-map-viz/dataset-dimension-range-selector';

import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetDimensionSelectorProps = {
    sequence: DatasetDimensionRasterSequence;
};

const DatasetDimensionSelector = (props: DatasetDimensionSelectorProps) => {

    const value = useSelector(() => {
        return props.sequence.sequenceDimension;
    });

    const dimensions = [...(props.sequence.config.dimensions || [])];

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
                props.sequence.setDimension(value as string);
            }}
        />
    );
};

type DatasetVariableSelectorProps = {
    sequence: DatasetDimensionRasterSequence
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
    let variableValue = useSelector(() => props.sequence.sequenceVariable);

    let variableFieldConfig = {
        choices: props.sequence.config.variables.map((variable) => {
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
                props.sequence.setVariable(value as string);
            }}
        />
    );
};


export type DatasetDimensionRasterSequenceFiltersProps = {
    sequence: DatasetDimensionRasterSequence;
};

export const DatasetDimensionRasterSequenceFilters = (props: DatasetDimensionRasterSequenceFiltersProps) => {


    let dimensionValueSelectors: JSX.Element[] | undefined;

    const selectedDimension = useSelector(() => {
        return props.sequence.sequenceDimension;
    });

    const selectedRange = useSelector(() => {
        return props.sequence.sequenceRange;
    });

    let dimensions = props.sequence.config.dimensions;
    if (dimensions.length) {
        dimensionValueSelectors = dimensions
        .filter(
            dimension => dimension.id !== selectedDimension
        ).map((dimension) => {
            return (
                <Form.Item key={dimension.id} label={dimension.name}>
                    <DatasetDimensionValueSelector
                        dimensionsState={props.sequence.dimensions}
                        dimension={dimension}
                        timeDistributionProvider={props.sequence.dataset.config.timeDistribution?.provider}
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
                onChange={(value) => props.sequence.setRange(value)}
            />
        );
    }

    const additionalFilters = useFormData({
        fields: props.sequence.config.additionalParameters || [],
        fieldValues: props.sequence.additionalParameters
    });

    return (
        <React.Fragment>
            <Form.Item label='Dimension'>
                <DatasetDimensionSelector
                    sequence={props.sequence}
                />
            </Form.Item>
            {dimensionRangeField}
            {dimensionValueSelectors}
            <Form.Item label='Variable'>
                <DatasetVariableSeletor
                    sequence={props.sequence}
                />
            </Form.Item>
            <Form.Item label='Location'>
                <AnalysisAoiFilter
                    analysis={props.sequence}
                    supportedGeometries={props.sequence.config.supportedGeometries}
                />
            </Form.Item>
            {additionalFilters &&
                <DataFormItems
                    {...additionalFilters}
                />
            }
        </React.Fragment>
    );

};
