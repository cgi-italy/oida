import React from 'react';
import { useObserver } from 'mobx-react';
import { Form } from 'antd';

import { IDatasetAnalysis, TRANSECT_SERIES_TYPE, IDatasetTransectSeries } from '@oida/eo';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';


type DatasetVariableSelectorProps = {
    series: IDatasetTransectSeries
};

const DatasetVariableSeletor = (props: DatasetVariableSelectorProps) => {
    let variableValue = useObserver(() => props.series.variable);

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
    analysis: IDatasetAnalysis
};

export const DatasetTransectSeriesFilters = (props: DatasetTransectSeriesFiltersProps) => {

    const datasetViz = props.analysis.datasetViz;

    const datasetSeries = datasetViz.datasetVizType === TRANSECT_SERIES_TYPE
        ? datasetViz as IDatasetTransectSeries
        : undefined;

    let dimensionValueSelectors: JSX.Element[] | undefined;

    if (datasetSeries) {
        let dimensions = datasetSeries.config.dimensions;
        if (dimensions && dimensions.length) {
            dimensionValueSelectors = dimensions
                .map((dimension) => {
                    return (
                        <Form.Item key={dimension.id} label={dimension.name}>
                            <DatasetDimensionValueSelector
                                dimensionsState={datasetSeries}
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
                        series={datasetSeries}
                    />
                </Form.Item>
                <Form.Item label='Area'>
                    <AnalysisAoiFilter
                        analysis={props.analysis}
                        supportedGeometries={[{
                            type: 'LineString',
                            constraints: {
                                maxCoords: datasetSeries.config.maxLineStringLength
                            }
                        }]}
                    />
                </Form.Item>
            </React.Fragment>
        );
    } else {
        return null;
    }
};
