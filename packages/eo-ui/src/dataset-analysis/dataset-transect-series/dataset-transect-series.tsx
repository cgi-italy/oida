import React, { useState } from 'react';
import { useObserver } from 'mobx-react';
import { castToSnapshot } from 'mobx-state-tree';

import { Form, Collapse } from 'antd';

import { v4 as uuid } from 'uuid';

import { DatasetTransectSeries, TRANSECT_SERIES_TYPE, DatasetTransectSeriesConfig, IDatasetTransectSeries } from '@oida/eo';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetTransectSeriesFilters } from './dataset-transect-series-filters';
import { DatasetTransectSeriesChart } from './dataset-transect-series-chart';


export const DatasetTransectSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const analyses = useObserver(() => props.combinedAnalysis.analyses);

    const datasets = props.datasets.filter(dataset => {
        return dataset.tools?.find(tool => tool.type === TRANSECT_SERIES_TYPE);
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

                                    const transectSeries = DatasetTransectSeries.create({
                                        dataset: value,
                                        config: datasetConfig!.tools!.find(
                                            tool => tool.type === TRANSECT_SERIES_TYPE
                                        )!.config as DatasetTransectSeriesConfig
                                    });

                                    props.combinedAnalysis.addAnalysis(castToSnapshot({
                                        id: uuid(),
                                        datasetViz: transectSeries,
                                        defaultColor: analysis.defaultColor,
                                    }), idx);
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetTransectSeriesFilters
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
    const series = useObserver(() => analyses.map((analysis) => analysis.datasetViz as IDatasetTransectSeries));
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

            <DatasetTransectSeriesChart
                series={series}
                colors={colors}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TRANSECT_SERIES_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetTransectSeriesAnalysis {...config}/>;
});
