import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetTransectValues, TRANSECT_VALUES_PROCESSING, DatasetTransectValuesConfig } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetTransectValuesProcessingFilters } from './dataset-transect-values-processing-filters';
import { DatasetTransectValuesProcessingChart } from './dataset-transect-values-processing-chart';

export const DatasetTransectValuesAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {
    const [filtersVisible, setFiltersVisible] = useState(true);

    const series = props.combinedAnalysis.processings as IObservableArray<DatasetTransectValues>;

    const seriesFilters = useSelector(
        () =>
            series.map((series, idx) => {
                series.setAutoUpdate(false);
                series.visible.setValue(true);

                const avaialbleDatasetItems = props.datasetExplorerItems.filter((item) => {
                    return item.dataset.config.tools?.find((tool) => tool.type === TRANSECT_VALUES_PROCESSING);
                });

                const availableTargets = props.availableCombos[props.combinedAnalysis.type].filter(
                    (combo) => combo.id !== props.combinedAnalysis.id
                );

                const selectedDataset = props.datasetExplorerItems.find((item) => item.dataset === series.dataset);
                if (!selectedDataset) {
                    setTimeout(() => {
                        props.combinedAnalysis.removeProcessing(series);
                    }, 0);
                }

                return (
                    <div className='analysis-parameters' key={series.id}>
                        <Form layout='inline' size='small'>
                            <Form.Item label='Dataset'>
                                <DatasetSelector
                                    value={series.dataset.id}
                                    datasets={avaialbleDatasetItems.map((item) => item.dataset.config)}
                                    onChange={(value) => {
                                        const aoi = series.aoi;
                                        props.combinedAnalysis.removeProcessing(series);
                                        if (value) {
                                            const item = avaialbleDatasetItems.find((item) => item.dataset.id === value);

                                            if (item) {
                                                const transectSeries = new DatasetTransectValues({
                                                    dataset: item.dataset,
                                                    config: item.dataset.config!.tools!.find(
                                                        (tool) => tool.type === TRANSECT_VALUES_PROCESSING
                                                    )!.config as DatasetTransectValuesConfig,
                                                    autoUpdate: false,
                                                    aoi: aoi,
                                                    parent: item.mapViz
                                                });

                                                props.combinedAnalysis.addProcessing(transectSeries, idx);
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                            <DatasetTransectValuesProcessingFilters series={series} />
                        </Form>
                        <AnalysisSeriesActions
                            analysis={series}
                            idx={idx}
                            availableTargets={availableTargets}
                            combinedAnalysis={props.combinedAnalysis}
                        />
                    </div>
                );
            }),
        [props.datasetExplorerItems, props.availableCombos]
    );

    const canRunQuery = useSelector(() => {
        return series.every((item) => item.canRunQuery);
    });

    return (
        <div className='dataset-chart'>
            {filtersVisible && (
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>{seriesFilters}</div>
                    <Button
                        className='dataset-chart-search-btn'
                        type='primary'
                        onClick={() => {
                            series.forEach((item) => item.retrieveData());
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
                    <Button
                        className='dataset-chart-modify-params-btn'
                        type='link'
                        icon={<LeftOutlined />}
                        onClick={() => {
                            series.forEach((item) => item.visible.setValue(true));
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    <DatasetTransectValuesProcessingChart series={series} />
                </div>
            )}
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TRANSECT_VALUES_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetTransectValuesAnalysisWidget {...config} />;
});
