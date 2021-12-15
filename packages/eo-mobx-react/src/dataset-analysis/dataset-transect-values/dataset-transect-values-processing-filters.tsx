import React from 'react';
import { Form } from 'antd';

import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetTransectValues } from '@oidajs/eo-mobx';
import { NumericFieldRenderer, SelectEnumRenderer } from '@oidajs/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';


type DatasetVariableSelectorProps = {
    series: DatasetTransectValues
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


export type DatasetTransectValuesProcessingFiltersProps = {
    series: DatasetTransectValues;
};

export const DatasetTransectValuesProcessingFilters = (props: DatasetTransectValuesProcessingFiltersProps) => {

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
                        timeDistributionProvider={props.series.dataset.config.timeDistribution?.provider}
                    />
                </Form.Item>
            );
        });
    }

    const numSamples = useSelector(() => {
        return props.series.numSamples;
    }, [props.series]);

    return (
        <React.Fragment>
            {dimensionValueSelectors}
            <Form.Item label='Variable'>
                <DatasetVariableSeletor
                    series={props.series}
                />
            </Form.Item>
            <Form.Item label='Path'>
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
            {props.series.config.supportsNumSamples &&
                <Form.Item label='Num samples'>
                    <NumericFieldRenderer
                        config={{
                            min: 2,
                            max: props.series.config.maxNumSamples || 50,
                            step: 1
                        }}
                        changeDelay={0}
                        value={numSamples}
                        onChange={(value) => props.series.setNumSamples(value)}
                    />
                </Form.Item>
            }
        </React.Fragment>
    );

};
