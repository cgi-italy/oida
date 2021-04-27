import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Collapse } from 'antd';

import { DatasetStatsAnalysis, STATS_ANALYSIS_TYPE, DatasetStatsAnalysisConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetStatsAnalysisFilters } from './dataset-stats-analysis-filters';
import { DatasetStatsAnalysisHistogram } from './dataset-stats-analysis-histogram';


export const DatasetStatsAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const analyses = props.combinedAnalysis.analyses as IObservableArray<DatasetStatsAnalysis>;

    const statsFilters = useSelector(() => analyses.map((analysis, idx) => {

        const datasets = props.datasets.filter(dataset => {
            return dataset.config.tools?.find(tool => tool.type === STATS_ANALYSIS_TYPE);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = props.datasets.find(dataset => dataset === analysis.dataset);
        if (!selectedDataset) {
            setImmediate(() => {
                props.combinedAnalysis.removeAnalysis(analysis);
            });
        }

        return (
            <div className='analysis-parameters' key={analysis.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={analysis.dataset.id}
                            datasets={datasets.map(dataset => dataset.config)}
                            onChange={(value) => {
                                props.combinedAnalysis.removeAnalysis(analysis);
                                if (value) {
                                    let dataset = props.datasets.find(dataset => dataset.id === value);

                                    if (dataset) {
                                        const statsAnalysis = new DatasetStatsAnalysis({
                                            dataset: dataset,
                                            config: dataset.config!.tools!.find(
                                                tool => tool.type === STATS_ANALYSIS_TYPE
                                            )!.config as DatasetStatsAnalysisConfig,
                                            aoi: analysis.aoi
                                        });


                                        props.combinedAnalysis.addAnalysis(statsAnalysis, idx);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetStatsAnalysisFilters
                        stats={analysis}
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
    }), [props.datasets, props.availableCombos]);

    return (
        <div className='dataset-chart'>
            <Collapse
                className='dataset-chart-filters'
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
                    header={<span className='show-filters-title'>Show stats parameters</span>}
                >
                    {statsFilters}
                </Collapse.Panel>
            </Collapse>

            <DatasetStatsAnalysisHistogram analyses={analyses}/>
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(STATS_ANALYSIS_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetStatsAnalysisWidget {...config}/>;
});
