import React, { useState } from 'react';
import { IObservableArray } from 'mobx';
import { Form, Button, Checkbox } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetPointSeries, POINT_SERIES_PROCESSING, DatasetPointSeriesConfig } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { AnalysisSeriesActions } from '../analysis-series-actions';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetPointSeriesFilters } from './dataset-point-series-filters';
import { DatasetPointSeriesChart } from './dataset-point-series-chart';


export const DatasetPointSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const series = props.combinedAnalysis.processings as IObservableArray<DatasetPointSeries>;

    let seriesFilters = useSelector(() => series.map((series, idx) => {

        series.setAutoUpdate(false);
        series.visible.setValue(true);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === POINT_SERIES_PROCESSING);
        });

        const availableTargets = props.availableCombos[props.combinedAnalysis.type]
            .filter((combo => combo.id !== props.combinedAnalysis.id));

        let selectedDataset = avaialbleDatasetItems.find(item => item.dataset === series.dataset);
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
                            datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                            onChange={(value) => {
                                const aoi = series.aoi;
                                props.combinedAnalysis.removeProcessing(series);
                                if (value) {
                                    let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                    if (item) {
                                        const dimensionSeries = new DatasetPointSeries({
                                            dataset: item.dataset,
                                            config: item.dataset.config!.tools!.find(
                                                tool => tool.type === POINT_SERIES_PROCESSING
                                            )!.config as DatasetPointSeriesConfig,
                                            autoUpdate: false,
                                            aoi: aoi,
                                            parent: item.mapViz
                                        });

                                        props.combinedAnalysis.addProcessing(dimensionSeries, idx);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetPointSeriesFilters
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

    const [smooth, setSmooth] = useState(false);

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
                    <div className='dataset-chart-actions'>
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
                        <Checkbox checked={smooth} onChange={(evt) => setSmooth(evt.target.checked)}>Smoothing</Checkbox>
                    </div>
                    <DatasetPointSeriesChart
                        series={series}
                        smooth={smooth}
                    />
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(POINT_SERIES_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetPointSeriesAnalysis {...config}/>;
});
