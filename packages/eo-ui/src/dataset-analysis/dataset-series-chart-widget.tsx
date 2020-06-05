import React from 'react';
import { useObserver } from 'mobx-react';

import { Form } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetAnalysis, IDatasetTimeSeries, IDatasetDomainSeries, isStatsDomainSeriesData, TIME_SERIES_TYPE } from '@oida/eo';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';

import { ChartWidget } from './chart-widget';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import { EChartOption } from 'echarts';

export type DatasetSeriesFiltersProps = {
    series: IDatasetDomainSeries | IDatasetTimeSeries
    analysis: IDatasetAnalysis
};

export const DatasetSeriesFilters = (props: DatasetSeriesFiltersProps) => {

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
        <React.Fragment>
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
                    supportedGeometries={props.series.config.supportedGeometries}
                />
            </Form.Item>
        </React.Fragment>
    );
};

export type DatasetSeriesChartWidgetProps<T extends IDatasetTimeSeries | IDatasetDomainSeries> = {
    series: T[];
    color: string;
};

export function DatasetSeriesChartWidget<T extends IDatasetTimeSeries | IDatasetDomainSeries>(props: DatasetSeriesChartWidgetProps<T>)  {

    let nextAxisIndex = 0;
    let axes = {};

    let loadingState = LoadingState.Init;

    let series = props.series;
    let isTime = false;
    if (series.length) {
        isTime = props.series[0].datasetVizType === TIME_SERIES_TYPE;
    }

    const {chartSeries, colors, legendData} = useObserver(() => {

        let chartSeries: EChartOption.SeriesLine[] = [];
        let colors: string[] = [];
        let legendData: string[] = [];

        props.series.forEach(series => {

            let variable = series.variable;
            if (!variable) {
                return;
            }

            let variableConfig = series.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return;
            }

            let axisName = variableConfig.units || 'default';
            if (!axes[axisName]) {
                axes[axisName] = {
                    idx: nextAxisIndex++,
                    label: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
                };
            }

            if (series.loadingState === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (series.loadingState === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            } else if (series.loadingState === LoadingState.Error && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Error;
            }

            let seriesData = (series as IDatasetDomainSeries).data;

            if (isStatsDomainSeriesData(seriesData)) {

                legendData.push(`${variableConfig.name} stats`);

                chartSeries.push({
                    type: 'line',
                    yAxisIndex: axes[axisName].idx,
                    smooth: true,
                    name: `${variableConfig.name} stats`,
                    data: seriesData.map((item) => [item.x, item.min]),
                    itemStyle: {
                        color: props.color
                    },
                    lineStyle: {
                        color: props.color,
                        width: 0.5
                    },
                    areaStyle: {
                        color: '#4a4a4a',
                        origin: 'start',
                        opacity: 1
                    },
                    z: -1,
                    showSymbol: false
                }, {
                    type: 'line',
                    yAxisIndex: axes[axisName].idx,
                    smooth: true,
                    name: `${variableConfig.name} stats`,
                    data: seriesData.map((item) => [item.x, item.max]),
                    itemStyle: {
                        color: props.color
                    },
                    lineStyle: {
                        color: props.color,
                        width: 0.5
                    },
                    areaStyle: {
                        color: props.color,
                        opacity: 0.2,
                        origin: 'start'
                    },
                    z: -2,
                    showSymbol: false
                }, {
                    type: 'line',
                    yAxisIndex: axes[axisName].idx,
                    smooth: true,
                    name: `${variableConfig.name} stats`,
                    data: seriesData.map((item) => [item.x, item.mean]),
                    itemStyle: {
                        color: props.color
                    },
                    lineStyle: {
                        width: 2
                    }
                });
            } else {

                colors.push(props.color);
                legendData.push(variableConfig.name);

                chartSeries.push({
                    type: 'line',
                    name: variableConfig.name,
                    yAxisIndex: axes[axisName].idx,
                    smooth: true,
                    data: seriesData.map((item) => [item.x, item.y])
                });
            }

        });

        return {chartSeries, colors, legendData};
    });

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Specify a point and a range to retrieve the data'
            />
        );
    }

    let yAxes = Object.keys(axes).map((axisName) => {
        return {
            type: 'value',
            name: axes[axisName].label,
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30
        };
    });

    let xAxisDomain = props.series[0].config.domain;

    let xAxisLabel = `${xAxisDomain.name}${xAxisDomain.units ? `(${xAxisDomain.units})` : ''}`;

    return (
        <ChartWidget
            options={{
                color: colors,
                legend: {
                    data: legendData,
                    right: '10px'
                },
                tooltip: {
                    trigger: 'axis',
                    transitionDuration: 0,
                    formatter: (params) => {
                        if (Array.isArray(params)) {
                            if (params.length === 1) {
                                return `${params[0].seriesName}: ${params[0].data[1].toFixed(2)}`;
                            } else {
                                return `
                                    <div>Mean: ${params[2].data[1].toFixed(2)}</div>
                                    <div>Min: ${params[0].data[1].toFixed(2)}</div>
                                    <div>Max: ${params[1].data[1].toFixed(2)}</div>
                                `;
                            }
                        } else {
                            return '';
                        }
                    },
                    axisPointer: {
                        type: 'line',
                        snap: true
                    }
                },
                xAxis: [{
                    type: isTime ? 'time' : 'value',
                    name: xAxisLabel,
                    nameLocation: 'middle'
                }],
                yAxis: yAxes,
                grid: {
                    left: 20,
                    right: 20,
                    bottom: 10,
                    top: 20,
                    containLabel: true
                },
                series: chartSeries,
                useUTC: true,
                backgroundColor: 'transparent'
            } as EChartOption}
            isLoading={loadingState === LoadingState.Loading}
        />
    );
}
