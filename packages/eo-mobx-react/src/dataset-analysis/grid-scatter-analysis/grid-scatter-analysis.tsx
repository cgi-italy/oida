import React, { useState } from 'react';
import { Button, Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { useSelector } from '@oidajs/ui-react-mobx';
import {
    DatasetAreaValues,
    DatasetAreaValuesConfig,
    GridScatterAnalysis,
    GRID_SCATTER_ANALYSIS,
    DATASET_AREA_VALUES_PROCESSING,
    DatasetToolConfig
} from '@oidajs/eo-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetSelector } from '../dataset-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';
import { DatasetAreaValuesProcessingFilters } from '../dataset-area-values';
import { GridScatterAnalysisPlot } from './grid-scatter-analysis-plot';

export type GridScatterAnalysisWidgetProps = Omit<DatasetAnalysisWidgetFactoryConfig, 'combinedAnalysis'> & {
    combinedAnalysis: GridScatterAnalysis;
};

export const GridScatterAnalysisWidget = (props: GridScatterAnalysisWidgetProps) => {
    const [filtersVisible, setFiltersVisible] = useState(true);

    const { x, y, color } = useSelector(() => {
        props.combinedAnalysis.xAxisAnalysis?.setAutoUpdate(false);
        props.combinedAnalysis.yAxisAnalysis?.setAutoUpdate(false);
        props.combinedAnalysis.colorMapAnalysis?.setAutoUpdate(false);

        return {
            x: props.combinedAnalysis.xAxisAnalysis,
            y: props.combinedAnalysis.yAxisAnalysis,
            color: props.combinedAnalysis.colorMapAnalysis
        };
    });

    const avaialbleDatasetItems = useSelector(
        () =>
            props.datasetExplorerItems.filter((item) => {
                const tool = item.dataset.config.tools?.find((tool) => tool.type === DATASET_AREA_VALUES_PROCESSING) as
                    | DatasetToolConfig<typeof DATASET_AREA_VALUES_PROCESSING>
                    | undefined;
                return tool && tool.config.supportedData.gridValues;
            }),
        [props.datasetExplorerItems]
    );

    const canRunQuery = useSelector(() => {
        return x && x.canRunQuery && y && y.canRunQuery && (!color || color.canRunQuery);
    }, [x, y, color]);

    return (
        <div className='dataset-chart'>
            {filtersVisible && (
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {x && (
                            <div className='analysis-parameters'>
                                <Form layout='inline' size='small'>
                                    <Form.Item label='Area'>
                                        <AnalysisAoiFilter analysis={x} supportedGeometries={x.config.supportedGeometries} />
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                        <div className='analysis-parameters'>
                            <Form layout='inline' size='small'>
                                <Form.Item label='X axis'>
                                    <DatasetSelector
                                        value={x?.dataset.id}
                                        datasets={avaialbleDatasetItems.map((item) => item.dataset.config)}
                                        onChange={(value) => {
                                            if (value) {
                                                const item = avaialbleDatasetItems.find((item) => item.dataset.id === value);

                                                if (item) {
                                                    const gridValues = new DatasetAreaValues({
                                                        dataset: item.dataset,
                                                        config: item.dataset.config!.tools!.find(
                                                            (tool) => tool.type === DATASET_AREA_VALUES_PROCESSING
                                                        )!.config as DatasetAreaValuesConfig,
                                                        autoUpdate: false,
                                                        parent: item.mapViz,
                                                        dataMask: {
                                                            gridValues: true,
                                                            image: false,
                                                            stats: false
                                                        }
                                                    });

                                                    props.combinedAnalysis.setXAnalysis(gridValues);
                                                }
                                            }
                                        }}
                                    />
                                </Form.Item>
                                {x && <DatasetAreaValuesProcessingFilters processing={x} disableAoi={true} />}
                            </Form>
                        </div>
                        <div className='analysis-parameters'>
                            <Form layout='inline' size='small'>
                                <Form.Item label='Y axis'>
                                    <DatasetSelector
                                        value={y?.dataset.id}
                                        datasets={avaialbleDatasetItems.map((item) => item.dataset.config)}
                                        onChange={(value) => {
                                            if (value) {
                                                const item = avaialbleDatasetItems.find((item) => item.dataset.id === value);

                                                if (item) {
                                                    const gridValues = new DatasetAreaValues({
                                                        dataset: item.dataset,
                                                        config: item.dataset.config!.tools!.find(
                                                            (tool) => tool.type === DATASET_AREA_VALUES_PROCESSING
                                                        )!.config as DatasetAreaValuesConfig,
                                                        autoUpdate: false,
                                                        parent: item.mapViz,
                                                        dataMask: {
                                                            gridValues: true,
                                                            image: false,
                                                            stats: false
                                                        }
                                                    });

                                                    props.combinedAnalysis.setYAnalysis(gridValues);
                                                }
                                            }
                                        }}
                                    />
                                </Form.Item>
                                {y && <DatasetAreaValuesProcessingFilters processing={y} disableAoi={true} />}
                            </Form>
                        </div>
                    </div>
                    <Button
                        className='dataset-chart-search-btn'
                        type='primary'
                        onClick={() => {
                            x?.retrieveData();
                            y?.retrieveData();
                            color?.retrieveData();
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
                            setFiltersVisible(true);
                        }}
                    >
                        Modify parameters
                    </Button>
                    <GridScatterAnalysisPlot gridScatter={props.combinedAnalysis} />
                </div>
            )}
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(GRID_SCATTER_ANALYSIS, (config: DatasetAnalysisWidgetFactoryConfig) => {
    const { combinedAnalysis, ...other } = config;
    return <GridScatterAnalysisWidget combinedAnalysis={combinedAnalysis as GridScatterAnalysis} {...other} />;
});
