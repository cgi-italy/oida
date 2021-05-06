import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

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

        analysis.setAutoUpdate(false);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === STATS_ANALYSIS_TYPE);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = avaialbleDatasetItems.find(item => item.dataset === analysis.dataset);
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
                            datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                            onChange={(value) => {
                                const aoi = analysis.aoi;
                                props.combinedAnalysis.removeAnalysis(analysis);
                                if (value) {
                                    let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                    if (item) {
                                        const statsAnalysis = new DatasetStatsAnalysis({
                                            dataset: item.dataset,
                                            config: item.dataset.config!.tools!.find(
                                                tool => tool.type === STATS_ANALYSIS_TYPE
                                            )!.config as DatasetStatsAnalysisConfig,
                                            aoi: aoi,
                                            autoUpdate: false,
                                            parent: item.mapViz
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
    }), [props.datasetExplorerItems, props.availableCombos]);

    const canRunQuery = useSelector(() => {
        return analyses.every((item) => item.canRunQuery);
    });

    return (
        <div className='dataset-chart'>
            {filtersVisible &&
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {statsFilters}
                    </div>
                    <Button
                        className='dataset-chart-search-btn'
                        type='primary'
                        onClick={() => {
                            analyses.forEach((item) => item.retrieveData());
                            setFiltersVisible(false);
                        }}
                        disabled={!canRunQuery}
                    >
                        Apply
                    </Button>
                </div>
            }
            {!filtersVisible &&
                <div className='dataset-chart-result'>
                    <Button
                        className='dataset-chart-modify-params-btn'
                        type='link'
                        icon={<LeftOutlined />}
                        onClick={() => {
                            analyses.forEach((item) => item.visible.setValue(true));
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    <DatasetStatsAnalysisHistogram analyses={analyses}/>
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(STATS_ANALYSIS_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetStatsAnalysisWidget {...config}/>;
});
