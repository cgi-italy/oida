import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Collapse } from 'antd';

import { DatasetDimensionSeries, DIMENSION_SERIES_TYPE, DatasetDimensionSeriesConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetDimensionSeriesFilters } from './dataset-dimension-series-filters';
import { DatasetDimensionSeriesChart } from './dataset-dimension-series-chart';


export const DatasetDimensionSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const series = props.combinedAnalysis.analyses as IObservableArray<DatasetDimensionSeries>;


    let seriesFilters = useSelector(() => series.map((series, idx) => {

        const datasets = props.datasets.filter(dataset => {
            return dataset.config.tools?.find(tool => tool.type === DIMENSION_SERIES_TYPE);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = props.datasets.find(dataset => dataset === series.dataset);
        if (!selectedDataset) {
            setImmediate(() => {
                props.combinedAnalysis.removeAnalysis(series);
            });
        }

        return (
            <div className='analysis-parameters' key={series.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={series.dataset.id}
                            datasets={datasets.map(dataset => dataset.config)}
                            onChange={(value) => {
                                props.combinedAnalysis.removeAnalysis(series);
                                if (value) {
                                    let dataset = props.datasets.find(dataset => dataset.id === value);

                                    if (dataset) {
                                        const dimensionSeries = new DatasetDimensionSeries({
                                            dataset: dataset,
                                            config: dataset.config!.tools!.find(
                                                tool => tool.type === DIMENSION_SERIES_TYPE
                                            )!.config as DatasetDimensionSeriesConfig
                                        });


                                        props.combinedAnalysis.addAnalysis(dimensionSeries, idx);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetDimensionSeriesFilters
                        series={series}
                    />

                </Form>
                <AnalysisSeriesActions
                    analysis={series}
                    idx={idx}
                    availableTargets={availableTargets}
                    combinedAnalysis={props.combinedAnalysis}
                />
            </div>
        );
    }), [props.datasets, props.availableCombos]);

    return (
        <div className='dataset-chart'>
            <Collapse
                accordion={true}
                activeKey={filtersVisible ? 'filters' : undefined}
                bordered={false}
                onChange={(activeKey) => {
                    if (activeKey === 'filters') {
                        setFiltersVisible(true);
                    } else {
                        setFiltersVisible(false);
                    }
                }}
            >
                <Collapse.Panel
                    key='filters'
                    header={<span className='show-filters-title'>Show series parameters</span>}
                >
                    {seriesFilters}
                </Collapse.Panel>
            </Collapse>

            <DatasetDimensionSeriesChart
                series={series}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DIMENSION_SERIES_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetDimensionSeriesAnalysis {...config}/>;
});
