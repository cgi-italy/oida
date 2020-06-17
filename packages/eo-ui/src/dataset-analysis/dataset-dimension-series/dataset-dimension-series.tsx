import React, { useState } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot, castToSnapshot } from 'mobx-state-tree';

import { Button, Form, Collapse, Dropdown, Menu } from 'antd';
import { CopyOutlined, CloseOutlined, ExportOutlined, EllipsisOutlined } from '@ant-design/icons';

import { v4 as uuid } from 'uuid';

import { DatasetDimensionSeries, DIMENSION_SERIES_TYPE, DatasetDimensionSeriesConfig, IDatasetDimensionSeries } from '@oida/eo';

import { DatasetSelector } from '../dataset-selector';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetDimensionSeriesFilters } from './dataset-dimension-series-filters';
import { DatasetDimensionSeriesChart } from './dataset-dimension-series-chart';


export const DatasetDimensionSeriesAnalysis = (props: DatasetAnalysisWidgetFactoryConfig) => {

    const [filtersVisible, setFiltersVisible] = useState(true);

    const analyses = useObserver(() => props.combinedAnalysis.analyses);

    const datasets = props.datasets.filter(dataset => {
        return dataset.tools?.find(tool => tool.type === DIMENSION_SERIES_TYPE);
    });

    const onSeriesAction = (action, analysis, idx) => {
        if (action === 'remove') {
            props.combinedAnalysis.removeAnalysis(analysis);
        } else if (action === 'undock') {
            props.combinedAnalysis.undockAnalysis(analysis);
        } else if (action === 'clone') {

            let series = analysis.datasetViz as IDatasetDimensionSeries;

            props.combinedAnalysis.addAnalysis({
                id: uuid(),
                datasetViz: {
                    ...getSnapshot(series),
                    id: uuid(),
                    aoi: series.aoi
                }
            }, idx + 1);
        }
    };

    let seriesFilters = analyses.map((analysis, idx) => {
        return (
            <div className='analysis-parameters' key={analysis.id}>
                <Form layout='inline' size='small'>
                    <Form.Item label='Dataset'>
                        <DatasetSelector
                            value={analysis.datasetViz.dataset.id}
                            datasets={datasets}
                            onChange={(value) => {
                                props.combinedAnalysis.removeAnalysis(analysis);
                                if (value) {
                                    let datasetConfig = props.datasets.find(dataset => dataset.id === value);

                                    const dimensionSeries = DatasetDimensionSeries.create({
                                        dataset: value,
                                        config: datasetConfig!.tools!.find(
                                            tool => tool.type === DIMENSION_SERIES_TYPE
                                        )!.config as DatasetDimensionSeriesConfig
                                    });

                                    props.combinedAnalysis.addAnalysis(castToSnapshot({
                                        id: uuid(),
                                        datasetViz: dimensionSeries,
                                        defaultColor: analysis.defaultColor,
                                    }), idx);
                                }
                            }}
                        />
                    </Form.Item>
                    <DatasetDimensionSeriesFilters
                        analysis={analysis}
                    />

                </Form>
                <div className='analysis-actions'>
                    <Dropdown
                        overlay={
                            <Menu onClick={(evt) => onSeriesAction(evt.key, analysis, idx)}>
                                <Menu.Item key='clone' icon={<CopyOutlined/>}>
                                    Clone series
                                </Menu.Item>
                                {analyses.length > 1 &&
                                    <Menu.Item key='remove' icon={<CloseOutlined />}>
                                        Remove series
                                    </Menu.Item>
                                }{analyses.length > 1 &&
                                    <Menu.Item key='undock' icon={<ExportOutlined/>}>
                                        Undock series
                                    </Menu.Item>
                                }

                            </Menu>
                        }
                    >
                        <Button
                            type='primary'
                            shape='circle'
                            size='small'
                        >
                            <EllipsisOutlined/>
                        </Button>
                    </Dropdown>
                </div>
            </div>
        );
    });

    const colors = useObserver(() => analyses.map((analysis) => analysis.color));
    const series = useObserver(() => analyses.map((analysis) => analysis.datasetViz as IDatasetDimensionSeries));
    return (
        <div className='dataset-chart'>
            <Collapse
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
                    header={<span className='show-filters-title'>Show series parameters</span>}
                >
                    {seriesFilters}
                </Collapse.Panel>
            </Collapse>

            <DatasetDimensionSeriesChart
                series={series}
                colors={colors}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DIMENSION_SERIES_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetDimensionSeriesAnalysis {...config}/>;
});
