import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Button, Collapse, Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

import { Dataset, DatasetGridValues, DatasetGridValuesConfig, GridScatterAnalysis, GRID_SCATTER_ANALYSIS, GRID_VALUES_TYPE } from '@oida/eo-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetSelector } from '../dataset-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';
import { DatasetGridValuesFilters } from './dataset-grid-values-filters';
import { GridScatterPlot } from './grid-scatter-plot';
import { useSelector } from '@oida/ui-react-mobx';


export type GridScatterAnalysisWidgetProps = Omit<DatasetAnalysisWidgetFactoryConfig, 'combinedAnalysis'> & {
    combinedAnalysis: GridScatterAnalysis
};

export const GridScatterAnalysisWidget = (props: GridScatterAnalysisWidgetProps) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const {x, y, color} = useSelector(() => {

        props.combinedAnalysis.xAxisAnalysis?.setAutoUpdate(false);
        props.combinedAnalysis.yAxisAnalysis?.setAutoUpdate(false);
        props.combinedAnalysis.colorMapAnalysis?.setAutoUpdate(false);

        return {
            x: props.combinedAnalysis.xAxisAnalysis,
            y: props.combinedAnalysis.yAxisAnalysis,
            color: props.combinedAnalysis.colorMapAnalysis
        };
    });

    const avaialbleDatasetItems = useSelector(() => props.datasetExplorerItems.filter(item => {
        return item.dataset.config.tools?.find(tool => tool.type === GRID_VALUES_TYPE);
    }), [props.datasetExplorerItems]);

    const canRunQuery = useSelector(() => {
        return (x && x.canRunQuery) && (y && y.canRunQuery) && (!color || color.canRunQuery);
    }, [x, y, color]);

    return (
        <div className='dataset-chart'>
            {filtersVisible &&
                <div className='dataset-chart-form'>
                    <div className='dataset-chart-filters'>
                        {x && <div className='analysis-parameters'>
                            <Form layout='inline' size='small'>
                                <Form.Item label='Area'>
                                    <AnalysisAoiFilter
                                        analysis={x}
                                        supportedGeometries={[{
                                            type: 'BBox'
                                        }]}
                                    />
                                </Form.Item>
                            </Form>
                        </div>}
                        <div className='analysis-parameters'>
                            <Form layout='inline' size='small'>
                                <Form.Item label='X axis'>
                                    <DatasetSelector
                                        value={x?.dataset.id}
                                        datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                                        onChange={(value) => {
                                            if (value) {
                                                let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                                if (item) {
                                                    const gridValues = new DatasetGridValues({
                                                        dataset: item.dataset,
                                                        config: item.dataset.config!.tools!.find(
                                                            tool => tool.type === GRID_VALUES_TYPE
                                                        )!.config as DatasetGridValuesConfig,
                                                        autoUpdate: false,
                                                        parent: item.mapViz
                                                    });

                                                    props.combinedAnalysis.setXAnalysis(gridValues);
                                                }
                                            }
                                        }}
                                    />
                                </Form.Item>
                                {x && <DatasetGridValuesFilters
                                    analysis={x}
                                    disableAoi={true}
                                />}
                            </Form>
                        </div>
                        <div className='analysis-parameters'>
                            <Form layout='inline' size='small'>
                                <Form.Item label='Y axis'>
                                    <DatasetSelector
                                        value={y?.dataset.id}
                                        datasets={avaialbleDatasetItems.map(item => item.dataset.config)}
                                        onChange={(value) => {
                                            if (value) {
                                                let item = avaialbleDatasetItems.find(item => item.dataset.id === value);

                                                if (item) {
                                                    const gridValues = new DatasetGridValues({
                                                        dataset: item.dataset,
                                                        config: item.dataset.config!.tools!.find(
                                                            tool => tool.type === GRID_VALUES_TYPE
                                                        )!.config as DatasetGridValuesConfig,
                                                        autoUpdate: false,
                                                        parent: item.mapViz
                                                    });

                                                    props.combinedAnalysis.setYAnalysis(gridValues);
                                                }
                                            }
                                        }}
                                    />
                                </Form.Item>
                                {y && <DatasetGridValuesFilters
                                    analysis={y}
                                    disableAoi={true}
                                />}
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
            }
            {!filtersVisible &&
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
                    <GridScatterPlot gridScatter={props.combinedAnalysis}/>
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(GRID_SCATTER_ANALYSIS, (config: DatasetAnalysisWidgetFactoryConfig) => {

    const {combinedAnalysis, ...other} = config;
    return (
        <GridScatterAnalysisWidget
            combinedAnalysis={combinedAnalysis as GridScatterAnalysis}
            {...other}
        />
    );
});
