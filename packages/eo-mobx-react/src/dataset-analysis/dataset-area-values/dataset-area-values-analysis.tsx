import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetAreaValues, DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetAreaValuesProcessingFilters } from './dataset-area-values-processing-filters';
import { DatasetAreaValuesProcessingHistogram } from './dataset-area-values-processing-histogram';


export const DatasetAreaValuesAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const processings = props.combinedAnalysis.processings as IObservableArray<DatasetAreaValues>;

    const statsFilters = useSelector(() => processings.map((processing, idx) => {

        processing.setAutoUpdate(false);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === DATASET_AREA_VALUES_PROCESSING);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = avaialbleDatasetItems.find(item => item.dataset === processing.dataset);
        if (!selectedDataset) {
            setImmediate(() => {
                props.combinedAnalysis.removeProcessing(processing);
            });
        }

        return (
            <div className='analysis-parameters' key={processing.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={processing.dataset.id}
                            datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                            onChange={(value) => {
                                const aoi = processing.aoi;
                                props.combinedAnalysis.removeProcessing(processing);
                                if (value) {
                                    let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                    if (item) {
                                        const areaValuesProcessing = new DatasetAreaValues({
                                            dataset: item.dataset,
                                            config: item.dataset.config!.tools!.find(
                                                tool => tool.type === DATASET_AREA_VALUES_PROCESSING
                                            )!.config as DatasetAreaValuesConfig,
                                            aoi: aoi,
                                            autoUpdate: false,
                                            parent: item.mapViz
                                        });


                                        props.combinedAnalysis.addProcessing(areaValuesProcessing, idx);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetAreaValuesProcessingFilters
                        processing={processing}
                    />

                </Form>
                <AnalysisSeriesActions
                    analysis={processing}
                    idx={idx}
                    availableTargets={availableTargets}
                    combinedAnalysis={props.combinedAnalysis}
                />
            </div>
        );
    }), [props.datasetExplorerItems, props.availableCombos]);

    const canRunQuery = useSelector(() => {
        return processings.every((item) => item.canRunQuery);
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
                            processings.forEach((item) => item.retrieveData());
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
                            processings.forEach((item) => item.visible.setValue(true));
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    <DatasetAreaValuesProcessingHistogram processings={processings}/>
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DATASET_AREA_VALUES_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetAreaValuesAnalysisWidget {...config}/>;
});
