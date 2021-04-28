import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Collapse, Form } from 'antd';

import { Dataset, DatasetGridValues, DatasetGridValuesConfig, GridScatterAnalysis, GRID_SCATTER_ANALYSIS, GRID_VALUES_TYPE } from '@oida/eo-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetSelector } from '../dataset-selector';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';
import { DatasetGridValuesFilters } from './dataset-grid-values-filters';
import { GridScatterPlot } from './grid-scatter-plot';


export type GridScatterAnalysisWidgetProps = Omit<DatasetAnalysisWidgetFactoryConfig, 'combinedAnalysis'> & {
    combinedAnalysis: GridScatterAnalysis
};

export const GridScatterAnalysisWidget = observer((props: GridScatterAnalysisWidgetProps) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const x = props.combinedAnalysis.xAxisAnalysis;
    const y = props.combinedAnalysis.yAxisAnalysis;
    const color = props.combinedAnalysis.colorMapAnalysis;

    const datasets = props.datasets.filter(dataset => {
        return dataset.config.tools?.find(tool => tool.type === GRID_VALUES_TYPE);
    });

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

                {x && <div className='analysis-parameters'><Form layout='inline' size='small'>
                    <Form.Item label='Area'>
                        <AnalysisAoiFilter
                            analysis={x}
                            supportedGeometries={[{
                                type: 'BBox'
                            }]}
                        />
                    </Form.Item>
                </Form></div>}
                <div className='analysis-parameters'>
                <Form layout='inline' size='small'>
                    <Form.Item label='X axis'>
                        <DatasetSelector
                            value={x?.dataset.id}
                            datasets={datasets.map(dataset => dataset.config)}
                            onChange={(value) => {
                                if (value) {
                                    let dataset = props.datasets.find(dataset => dataset.id === value);

                                    if (dataset) {
                                        const gridValues = new DatasetGridValues({
                                            dataset: dataset,
                                            config: dataset.config!.tools!.find(
                                                tool => tool.type === GRID_VALUES_TYPE
                                            )!.config as DatasetGridValuesConfig
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
                            datasets={datasets.map(dataset => dataset.config)}
                            onChange={(value) => {
                                if (value) {
                                    let dataset = props.datasets.find(dataset => dataset.id === value);

                                    if (dataset) {
                                        const gridValues = new DatasetGridValues({
                                            dataset: dataset,
                                            config: dataset.config!.tools!.find(
                                                tool => tool.type === GRID_VALUES_TYPE
                                            )!.config as DatasetGridValuesConfig
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
                </Collapse.Panel>
            </Collapse>
            <GridScatterPlot gridScatter={props.combinedAnalysis}/>
        </div>
    );
});

DatasetAnalysisWidgetFactory.register(GRID_SCATTER_ANALYSIS, (config: DatasetAnalysisWidgetFactoryConfig) => {

    const {combinedAnalysis, ...other} = config;
    return (
        <GridScatterAnalysisWidget
            combinedAnalysis={combinedAnalysis as GridScatterAnalysis}
            {...other}
        />
    );
});
