import React, { useState } from 'react';
import { useObserver } from 'mobx-react';
import { castToSnapshot } from 'mobx-state-tree';

import { Form, Collapse } from 'antd';

import { v4 as uuid } from 'uuid';

import { DatasetDimensionSeries, DIMENSION_SERIES_TYPE, DatasetDimensionSeriesConfig, IDatasetDimensionSeries } from '@oida/eo';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetDimensionSeriesFilters } from './dataset-dimension-series-filters';
import { DatasetDimensionSeriesChart } from './dataset-dimension-series-chart';


export const DatasetDimensionSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const analyses = useObserver(() => props.combinedAnalysis.analyses);

    const datasets = props.datasets.filter(dataset => {
        return dataset.tools?.find(tool => tool.type === DIMENSION_SERIES_TYPE);
    });

    const availableTargets = useObserver(() => {
        return (props.availableCombos[props.combinedAnalysis.type] || []).filter((combo => combo.id !== props.combinedAnalysis.id));
    });

    let seriesFilters = analyses.map((analysis, idx) => {
        return (
            <div className='analysis-parameters' key={analysis.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={analysis.datasetViz.dataset.id}
                            datasets={datasets}
                            onChange={(value) => {
                                props.combinedAnalysis.removeAnalysis(analysis);
                                if (value) {
                                    let datasetConfig = props.datasets.find(dataset => dataset.id === value);

                                    const dimensionSeries = DatasetDimensionSeries.create({
                                        dataset: value,
                                        config: datasetConfig!.tools!.find(
                                            tool => tool.type === DIMENSION_SERIES_TYPE
                                        )!.config as DatasetDimensionSeriesConfig
                                    });

                                    props.combinedAnalysis.addAnalysis(castToSnapshot({
                                        id: uuid(),
                                        datasetViz: dimensionSeries,
                                        defaultColor: analysis.defaultColor,
                                    }), idx);
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetDimensionSeriesFilters
                        analysis={analysis}
                        linkedAois={props.linkedAois}
                    />

                </Form>
                <AnalysisSeriesActions
                    analysis={analysis}
                    idx={idx}
                    availableTargets={availableTargets}
                    combinedAnalysis={props.combinedAnalysis}
                />
            </div>
        );
    });

    const colors = useObserver(() => analyses.map((analysis) => analysis.color));
    const series = useObserver(() => analyses.map((analysis) => analysis.datasetViz as IDatasetDimensionSeries));
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
                colors={colors}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DIMENSION_SERIES_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetDimensionSeriesAnalysis {...config}/>;
});
