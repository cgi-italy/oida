import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetTransectSeries, TRANSECT_SERIES_TYPE, DatasetTransectSeriesConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetTransectSeriesFilters } from './dataset-transect-series-filters';
import { DatasetTransectSeriesChart } from './dataset-transect-series-chart';


export const DatasetTransectSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const series = props.combinedAnalysis.analyses as IObservableArray<DatasetTransectSeries>;

    let seriesFilters = useSelector(() => series.map((series, idx) => {

        series.setAutoUpdate(false);
        series.visible.setValue(true);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === TRANSECT_SERIES_TYPE);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = props.datasetExplorerItems.find(item => item.dataset === series.dataset);
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
                            datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                            onChange={(value) => {
                                const aoi = series.aoi;
                                props.combinedAnalysis.removeAnalysis(series);
                                if (value) {
                                    let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                    if (item) {
                                        const transectSeries = new DatasetTransectSeries({
                                            dataset: item.dataset,
                                            config: item.dataset.config!.tools!.find(
                                                tool => tool.type === TRANSECT_SERIES_TYPE
                                            )!.config as DatasetTransectSeriesConfig,
                                            autoUpdate: false,
                                            aoi: aoi,
                                            parent: item.mapViz
                                        });

                                        props.combinedAnalysis.addAnalysis(transectSeries, idx);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetTransectSeriesFilters
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
    }), [props.datasetExplorerItems, props.availableCombos]);

    const canRunQuery = useSelector(() => {
        return series.every((item) => item.canRunQuery);
    });

    return (
        <div className='dataset-chart'>
            {filtersVisible &&
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {seriesFilters}
                    </div>
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
            }
            {!filtersVisible &&
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
                    <DatasetTransectSeriesChart
                        series={series}
                    />
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TRANSECT_SERIES_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetTransectSeriesAnalysis {...config}/>;
});
