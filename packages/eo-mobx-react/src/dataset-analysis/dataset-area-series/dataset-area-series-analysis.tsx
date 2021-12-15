import React, { useState } from 'react';
import { Form, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { formatNumber } from '@oidajs/core';
import { DatasetAreaSeries, DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeriesConfig, DomainRange } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetSelector } from '../dataset-selector';
import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetAreaSeriesPrcessingFilters } from './dataset-area-series-processing-filters';
import { DatasetAreaSeriesProcessingChart } from './dataset-area-series-processing-chart';


export const DatasetAreaSeriesAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const getSeries = () => {
        if (!props.combinedAnalysis.processings.length) {
            return undefined;
        }
        return props.combinedAnalysis.processings[0] as DatasetAreaSeries;
    };

    const series = useSelector(() => {
        return getSeries();
    });

    let seriesFilters = useSelector(() => {

        const series = getSeries();
        if (!series) {
            return null;
        }

        series.setAutoUpdate(false);

        const avaialbleDatasetItems = props.datasetExplorerItems.filter(item => {
            return item.dataset.config.tools?.find(tool => tool.type === DATASET_AREA_SERIES_PROCESSING);
        });

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
                                        const tool = item.dataset.config!.tools!.find(
                                            tool => tool.type === DATASET_AREA_SERIES_PROCESSING
                                        );

                                        const areaSeries = new DatasetAreaSeries({
                                            dataset: item.dataset,
                                            config: tool!.config as DatasetAreaSeriesConfig,
                                            autoUpdate: false,
                                            aoi: aoi,
                                            parent: item.mapViz,
                                            dataMask: {
                                                gridValues: false,
                                                image: true,
                                                stats: true
                                            },
                                            ...tool?.defaultParams
                                        });

                                        props.combinedAnalysis.addProcessing(areaSeries);
                                    }
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetAreaSeriesPrcessingFilters
                        series={series}
                    />

                </Form>
            </div>
        );
    }, [props.datasetExplorerItems]);

    const canRunQuery = useSelector(() => {
        const sequence = getSeries();
        return sequence?.canRunQuery;
    });

    const [dataRange, setDataRange] = useState<DomainRange<number>>();

    return (
        <div className='dataset-dimension-raster-sequence dataset-chart'>
            {filtersVisible &&
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {seriesFilters}
                    </div>
                    <Button
                        className='dataset-chart-search-btn'
                        type='primary'
                        onClick={() => {
                            const series = getSeries();
                            series?.retrieveData().then(() => {
                                if (series.data.length) {
                                    const minmax = series.data.reduce((minmax, item) => {
                                        const min = typeof(item.data.stats?.min) === 'number' ? item.data.stats.min : Number.MAX_VALUE;
                                        const max = typeof(item.data.stats?.max) === 'number' ? item.data.stats.max : -Number.MAX_VALUE;
                                        return [
                                            Math.min(min, minmax[0]),
                                            Math.max(max, minmax[1])
                                        ];
                                    }, [Number.MAX_VALUE, -Number.MAX_VALUE]);

                                    const dataRange = {
                                        min: parseFloat(formatNumber(minmax[0], {
                                            precision: 3
                                        })),
                                        max: parseFloat(formatNumber(minmax[1], {
                                            precision: 3
                                        }))
                                    };
                                    setDataRange(dataRange);
                                    series.colorMap?.domain?.setRange(dataRange);
                                }
                            });
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
                            const series = getSeries();
                            series?.visible.setValue(true);
                            props.combinedAnalysis.processings[0].visible.setValue(true);
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    {series &&
                        <DatasetAreaSeriesProcessingChart
                            series={series}
                            dataRange={dataRange}
                        />
                    }
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DATASET_AREA_SERIES_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetAreaSeriesAnalysisWidget {...config}/>;
});
