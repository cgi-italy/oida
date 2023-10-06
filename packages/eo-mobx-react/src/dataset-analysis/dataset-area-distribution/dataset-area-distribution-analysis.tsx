import React, { useEffect, useRef, useState } from 'react';
import { IObservableArray } from 'mobx';
import { Button, Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetAreaDistribution, DatasetAreaDistributionConfig, DATASET_AREA_DISTRIBUTION_PROCESSING } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetSelector } from '../dataset-selector';
import { DatasetAreaDistributionProcessingFilters } from './dataset-area-distribution-processing-filters';
import { DatasetAreaValuesProcessingChart } from './dataset-area-distribution-processing-chart';
import { AnalysisSeriesActions } from '../analysis-series-actions';

export const DatasetAreaDistributionAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {
    const [filtersVisible, setFiltersVisible] = useState(true);

    const processings = props.combinedAnalysis.processings as IObservableArray<DatasetAreaDistribution>;

    const statsFilter = useSelector(
        () =>
            processings.map((processing, index) => {
                const avaialbleDatasetItems = props.datasetExplorerItems.filter((item) => {
                    return item.dataset.config.tools?.find((tool) => tool.type === DATASET_AREA_DISTRIBUTION_PROCESSING);
                });

                const selectedDataset = avaialbleDatasetItems.find((item) => item.dataset === processing.dataset);
                if (!selectedDataset) {
                    setTimeout(() => {
                        props.combinedAnalysis.removeProcessing(processing);
                    }, 0);
                }

                const availableTargets = props.availableCombos[props.combinedAnalysis.type].filter(
                    (combo) => combo.id !== props.combinedAnalysis.id
                );

                return (
                    <div className='analysis-parameters' key={processing.id}>
                        <Form layout='inline' size='small'>
                            <Form.Item label='Dataset'>
                                <DatasetSelector
                                    value={processing.dataset.id}
                                    datasets={avaialbleDatasetItems.map((item) => item.dataset.config)}
                                    onChange={(value) => {
                                        const aoi = processing.aoi;
                                        props.combinedAnalysis.removeProcessing(processing);
                                        if (value) {
                                            const item = avaialbleDatasetItems.find((item) => item.dataset.id === value);

                                            if (item) {
                                                const areaValuesProcessing = new DatasetAreaDistribution({
                                                    dataset: item.dataset,
                                                    config: item.dataset.config!.tools!.find(
                                                        (tool) => tool.type === DATASET_AREA_DISTRIBUTION_PROCESSING
                                                    )!.config as DatasetAreaDistributionConfig,
                                                    aoi: aoi,
                                                    autoUpdate: false,
                                                    parent: item.mapViz
                                                });

                                                props.combinedAnalysis.addProcessing(areaValuesProcessing, index);
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                            <DatasetAreaDistributionProcessingFilters processing={processing} />
                        </Form>
                        <AnalysisSeriesActions
                            analysis={processing}
                            idx={index}
                            availableTargets={availableTargets}
                            combinedAnalysis={props.combinedAnalysis}
                        />
                    </div>
                );
            }),
        [props.datasetExplorerItems, props.availableCombos]
    );

    const canRunQuery = useSelector(() => {
        return processings.every((item) => item.canRunQuery);
    });

    useEffect(() => {
        // this is to support autorun on workspace load
        // TODO: handle this at workspace load level
        let shouldRetrieveData = canRunQuery;
        processings.forEach((item) => {
            if (item.autoUpdate) {
                item.setAutoUpdate(false);
            } else {
                shouldRetrieveData = false;
            }
        });

        if (shouldRetrieveData) {
            processings.forEach((item) => item.retrieveData());
            setFiltersVisible(false);
        }
    }, []);

    const actionContainer = useRef<HTMLDivElement>(null);

    return (
        <div className='dataset-chart'>
            {filtersVisible && (
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>{statsFilter}</div>
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
            )}
            {!filtersVisible && (
                <div className='dataset-chart-result'>
                    <div className='dataset-chart-actions'>
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
                        <div ref={actionContainer} />
                    </div>
                    <DatasetAreaValuesProcessingChart processings={processings} actionContainer={actionContainer} />
                </div>
            )}
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DATASET_AREA_DISTRIBUTION_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetAreaDistributionAnalysisWidget {...config} />;
});
