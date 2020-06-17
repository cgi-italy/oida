import React from 'react';
import { useObserver } from 'mobx-react';
import { Form } from 'antd';

import { IDatasetAnalysis,  IDatasetDimensionRasterSequence, DIMENSION_RASTER_SEQUENCE_TYPE } from '@oida/eo';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetDimensionValueSelector } from '../../dataset-map-viz/dataset-dimension-value-selector';
import { DatasetDimensionRangeSelector } from '../../dataset-map-viz/dataset-dimension-range-selector';

import { AnalysisAoiFilter } from '../analysis-aoi-filter';

type DatasetDimensionSelectorProps = {
    series: IDatasetDimensionRasterSequence
};

const DatasetDimensionSelector = (props: DatasetDimensionSelectorProps) => {

    const value = useObserver(() => {
        return props.series.dimension;
    });

    const dimensions = props.series.config.dimensions;

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


export type DatasetDimensionRasterSequenceFiltersProps = {
    analysis: IDatasetAnalysis
};

export const DatasetDimensionRasterSequenceFilters = (props: DatasetDimensionRasterSequenceFiltersProps) => {

    const datasetViz = props.analysis.datasetViz;

    const datasetSeries = datasetViz.datasetVizType === DIMENSION_RASTER_SEQUENCE_TYPE
        ? datasetViz as IDatasetDimensionRasterSequence
        : undefined;

    let dimensionValueSelectors: JSX.Element[] | undefined;

    const selectedDimension = useObserver(() => {
        return datasetSeries ? datasetSeries.dimension : undefined;
    });

    const selectedRange = useObserver(() => {
        return datasetSeries ? datasetSeries.range : undefined;
    });

    if (datasetSeries) {
        let dimensions = datasetSeries.config.dimensions;
        if (dimensions && dimensions.length) {
            dimensionValueSelectors = dimensions
                .filter(dimension => dimension.id !== selectedDimension)
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

        let dimensionRangeField: JSX.Element | undefined;
        const dimension = dimensions?.find(dimension => dimension.id === selectedDimension);

        if (dimension) {
            dimensionRangeField = (
                <DatasetDimensionRangeSelector
                    dimension={dimension}
                    value={selectedRange}
                    onChange={(value) => datasetSeries.setRange(value)}
                />
            );
        }

        return (
            <React.Fragment>
                <Form.Item label='Dimension'>
                    <DatasetDimensionSelector
                        series={datasetSeries}
                    />
                </Form.Item>
                {dimensionRangeField}
                {dimensionValueSelectors}
                <Form.Item label='Area'>
                    <AnalysisAoiFilter
                        analysis={props.analysis}
                        supportedGeometries={datasetSeries.config.supportedGeometries}
                    />
                </Form.Item>
            </React.Fragment>
        );
    } else {
        return null;
    }

};
