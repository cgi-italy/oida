import React from 'react';
import { useObserver } from 'mobx-react';

import { Form } from 'antd';
import { EChartOption } from 'echarts';
import getDistance from '@turf/distance';

import { LoadingState } from '@oida/core';
import { IDatasetAnalysis, IDatasetTransectSeries, TRANSECT_SERIES_TYPE } from '@oida/eo';
import { DateFieldRenderer, SelectEnumRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';
import { ChartWidget } from './chart-widget';


export type DatasetTransectSeriesChartWidgetProps = {
    series: IDatasetTransectSeries;
    color: string;
};

export const DatasetTransectSeriesChartWidget = (props: DatasetTransectSeriesChartWidgetProps) => {


    const seriesData = useObserver(() => {

        let series = props.series;

        let variable = series.variable;
        if (!variable) {
            return;
        }

        let variableConfig = series.config.variables.find((v) => v.id === variable);
        if (!variableConfig) {
            return;
        }

        if (!series.geometry) {
            return;
        }

        const coords = (series.geometry as GeoJSON.LineString).coordinates;
        const distance = getDistance(coords[0], coords[1]);

        return {
            legend: variableConfig.name,
            lineSeries: {
                type: 'line',
                name: variableConfig.name,
                yAxisIndex: 0,
                smooth: true,
                data: series.data.map((item, idx) => [idx / series.data.length * distance, item])
            },
            loadingState: series.loadingState,
            axisLabel: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
        };
    });

    if (!seriesData) {
        return null;
    }

    if (seriesData.loadingState === LoadingState.Init || seriesData.loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={seriesData.loadingState}
                initMessage='Specify a point and a range to retrieve the data'
            />
        );
    }

    return (
        <ChartWidget
            options={{
                color: [props.color],
                legend: {
                    data: [seriesData.legend],
                    right: '10px'
                },
                tooltip: {
                    trigger: 'axis',
                    transitionDuration: 0,
                    axisPointer: {
                        type: 'line',
                        snap: true
                    }
                },
                xAxis: [{
                    type: 'value',
                    name: 'Relative distance (km)',
                    nameLocation: 'middle'
                }],
                yAxis: [{
                    type: 'value',
                    name: seriesData.axisLabel,
                    nameRotate: 90,
                    nameLocation: 'middle',
                    nameGap: 30
                }],
                grid: {
                    left: 20,
                    right: 20,
                    bottom: 10,
                    top: 20,
                    containLabel: true
                },
                series: [seriesData.lineSeries],
                backgroundColor: 'transparent'
            } as EChartOption}
            isLoading={seriesData.loadingState === LoadingState.Loading}
        />
    );
};


export type DatasetTransectSeriesProps = {
    date?: Date
    onDateChange: (date?: Date) => void;
    timeDomain?: {min: Date, max: Date}
    analysis: IDatasetAnalysis;
    series: IDatasetTransectSeries;
};

export const DatasetTransectSeriesChart = (props: DatasetTransectSeriesProps) => {

    let color = useObserver(() => props.analysis.color);

    let variableValue = useObserver(() => props.series.variable);

    let variableFieldConfig = {
        choices: props.series.config.variables.map((variable) => {
            return {
                value: variable.id,
                name: variable.name
            };
        })
    };

    return (
        <div className='dataset-chart'>
            <Form layout='inline' size='small'>
                <Form.Item>
                    <DateFieldRenderer
                        value={props.date}
                        onChange={props.onDateChange}
                        config={{
                            minDate: props.timeDomain ? props.timeDomain.min : undefined,
                            maxDate: props.timeDomain ? props.timeDomain.max : undefined,
                            withTime: true
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <SelectEnumRenderer
                        config={variableFieldConfig}
                        value={variableValue}
                        placeholder='Select variable'
                        onChange={(value) => {
                            props.series.setVariable(value as string);
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <AnalysisAoiFilter
                        analysis={props.analysis}
                        supportedGeometries={[{
                            type: 'LineString',
                            constraints: {
                                maxCoords: 2
                            }
                        }]}
                    />
                </Form.Item>
            </Form>
            <DatasetTransectSeriesChartWidget
                series={props.series}
                color={color}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TRANSECT_SERIES_TYPE, (config) => {

    let analysis = config.analysis as IDatasetAnalysis;
    let transectSeriesViz = analysis.datasetViz as IDatasetTransectSeries;
    if (!transectSeriesViz.variable) {
        transectSeriesViz.setVariable(transectSeriesViz.config.variables[0].id);
    }
    if (!transectSeriesViz.date) {
        let toi = transectSeriesViz.dataset.searchParams.filters.get('time');
        if (toi) {
            transectSeriesViz.setDate(toi.end);
        } else if (transectSeriesViz.dataset.config.timeDistribution) {
            let timeProvider = transectSeriesViz.dataset.config.timeDistribution.provider;
            timeProvider.getTimeExtent({}).then((range) => {
                if (range) {
                    transectSeriesViz.setDate(new Date(range.start));
                }
            });
        }
    }
    return <DatasetTransectSeriesChart
        series={transectSeriesViz}
        analysis={analysis}
        date={transectSeriesViz.date}
        onDateChange={(date) => {
            transectSeriesViz.setDate(date);
        }}
    />;
});
