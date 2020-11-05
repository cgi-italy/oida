import React from 'react';

import { LoadingState } from '@oida/core';
import { DatasetDimensionSeries, isStatsDimensionSeriesData, DatasetDimension, isValueDomain, DataDomain, isDomainProvider } from '@oida/eo-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';

import { ChartWidget } from '../chart-widget';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import { EChartOption } from 'echarts';
import { useSelector } from '@oida/ui-react-mobx';


export type DatasetDimensionSeriesChartProps = {
    series: DatasetDimensionSeries[];
};

type LegendDataItem = {
    id: string,
    name: string,
    type: 'point' | 'area',
    description?: string
};

export function DatasetDimensionSeriesChart(props: DatasetDimensionSeriesChartProps) {

    const {chartSeries, colors, loadingState, legendData, axes} = useSelector(() => {

        let chartSeries: EChartOption.SeriesLine[] = [];
        let colors: string[] = [];

        let loadingState = LoadingState.Init;
        const legendData: LegendDataItem[] = [];

        let axes = {
            x: {},
            y: {}
        };

        let nextXAxisIndex = 0;
        let nextYAxisIndex = 0;

        props.series.forEach((series, idx) => {

            let variable = series.seriesVariable;
            if (!variable) {
                return;
            }

            let variableConfig = series.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return;
            }

            let dimension = series.seriesDimension;

            let dimensionConfig: DatasetDimension<DataDomain<number | string | Date>> | undefined;
            if (dimension === 'time') {
                dimensionConfig = {
                    id: 'time',
                    name: 'Time'
                };
            } else {
                dimensionConfig = series.config.dimensions?.find((d) => d.id === series.seriesDimension);
            }

            if (!dimensionConfig) {
                return;
            }

            if (!axes.x[dimensionConfig.id]) {
                let axisType: string;
                if (dimensionConfig.id === 'time') {
                    axisType = 'time';
                } else {
                    axisType = dimensionConfig.domain && !isDomainProvider(dimensionConfig.domain) && isValueDomain(dimensionConfig.domain)
                        ? 'value'
                        : 'category';
                }
                axes.x[dimensionConfig.id] = {
                    idx: nextXAxisIndex++,
                    label: `${dimensionConfig.name} ${dimensionConfig.units ? `(${dimensionConfig.units})` : ''}`,
                    type: axisType
                };
            }

            let yAxisUnits = variableConfig.units || variableConfig.id;
            if (!axes.y[yAxisUnits]) {
                axes.y[yAxisUnits] = {
                    idx: nextYAxisIndex++,
                    label: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
                };
            }

            if (series.loadingState.value === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (series.loadingState.value === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            }

            if (isStatsDimensionSeriesData(series.data)) {

                legendData[idx] = {
                    id: `${idx}`,
                    type: 'area',
                    name: `${series.dataset.config.name}: ${variableConfig.name} stats`
                };

                chartSeries.push({
                    type: 'line',
                    xAxisIndex: axes.x[dimensionConfig.id].idx,
                    yAxisIndex: axes.y[yAxisUnits].idx,
                    smooth: true,
                    name: `${idx}`,
                    data: series.data.map((item) => [item.x as number, item.min]),
                    itemStyle: {
                        color: series.color
                    },
                    lineStyle: {
                        color: series.color,
                        width: 0.5
                    },
                    areaStyle: {
                        //TODO: this should be equal to the chart background color
                        color: '#4a4a4a',
                        origin: 'start',
                        opacity: 1
                    },
                    z: -1,
                    showSymbol: false
                }, {
                    type: 'line',
                    xAxisIndex: axes.x[dimensionConfig.id].idx,
                    yAxisIndex: axes.y[yAxisUnits].idx,
                    smooth: true,
                    name: `${idx}`,
                    data: series.data.map((item) => [item.x as number, item.max]),
                    itemStyle: {
                        color: series.color
                    },
                    lineStyle: {
                        color: series.color,
                        width: 0.5
                    },
                    areaStyle: {
                        color: series.color,
                        opacity: 0.1,
                        origin: 'start'
                    },
                    z: -2,
                    showSymbol: false
                }, {
                    type: 'line',
                    xAxisIndex: axes.x[dimensionConfig.id].idx,
                    yAxisIndex: axes.y[yAxisUnits].idx,
                    smooth: true,
                    name: `${idx}`,
                    data: series.data.map((item) => [item.x as number, item.mean]),
                    itemStyle: {
                        color: series.color
                    },
                    lineStyle: {
                        width: 2
                    }
                });
            } else {

                colors.push(series.color);
                legendData[idx] = {
                    id: `${idx}`,
                    type: 'point',
                    name: `${series.dataset.config.name}: ${variableConfig.name}`
                };

                chartSeries.push({
                    type: 'line',
                    name: `${idx}`,
                    xAxisIndex: axes.x[dimensionConfig.id].idx,
                    yAxisIndex: axes.y[yAxisUnits].idx,
                    smooth: true,
                    data: series.data.map((item) => [item.x as number, item.y])
                });
            }

        });

        return {chartSeries, colors, legendData, loadingState, axes};
    });

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    }

    let yAxes = Object.keys(axes.y).map((axisUnits, idx) => {
        return {
            type: 'value',
            name: axes.y[axisUnits].label,
            nameLocation: 'end',
            position: (idx % 2) ? 'right' : 'left',
            nameGap: 20,
            width: '100px',
            offset: Math.floor(idx / 2) * 60,
            axisLine: {
                onZero: false
            },
            scale: true
        };
    });

    let xAxes = Object.keys(axes.x).map((dimensionId) => {
        return {
            type: axes.x[dimensionId].type,
            name: axes.x[dimensionId].label,
            nameLocation: 'middle',
            nameGap: 40,
            axisLine: {
                onZero: false
            }
        };
    });

    return (
        <div className='series-chart'>
            <ChartWidget
                options={{
                    color: colors,
                    legend: {
                        data: legendData.map(item => item.id),
                        right: '10px',
                        formatter: (name) => {
                            return legendData[name].name;
                        },
                        tooltip: {
                            show: true,
                            formatter: (data) => {
                                return legendData[(data as EChartOption.Tooltip.Format).name!].description || '';
                            }
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        transitionDuration: 0,
                        formatter: (series: EChartOption.Tooltip.Format[]) => {
                            let axisValues: Array<{label: string, content: string[]}> = [];
                            let idx = 0;
                            while (idx < series.length) {
                                let data = series[idx];
                                let seriesInfo = legendData[parseInt(data.seriesName!)];
                                let seriesContent: string;
                                if (seriesInfo.type === 'point') {
                                    seriesContent = `
                                        <div class="series-item is-point">
                                            <span>${data.marker}</span>
                                            <span class="label">${seriesInfo.name}:</span>
                                            <span class="value">${data.data[1].toFixed(2)}</span>
                                        </div>`;
                                    idx++;
                                } else {
                                    seriesContent = `
                                        <div class="series-item is-area">
                                            <div class="series-header">
                                                <span>${data.marker}</span>
                                                <span class="label">${seriesInfo.name}:</span>
                                            </div>
                                            <div class="series-value">
                                                <div>
                                                    <span class="label">Min:</span>
                                                    <span class="value">${data.data[1].toFixed(2)}<span>
                                                </div>
                                                <div>
                                                    <span class="label">Max:</span>
                                                    <span class="value">${series[idx + 1].data[1].toFixed(2)}<span>
                                                </div>
                                                <div>
                                                    <span class="label">Mean:</span>
                                                    <span class="value">${series[idx + 2].data[1].toFixed(2)}<span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                    idx += 3;
                                }

                                const axisIndex = (data as any).axisIndex;

                                let value = axisValues[axisIndex] || {
                                    label: data.axisValueLabel,
                                    content: []
                                };
                                value.content.push(seriesContent);

                                axisValues[axisIndex] = value;
                            }
                            let items = axisValues.map((value, idx) => {
                                return `
                                    <div class="axis-item">
                                        <div class="axis-header">
                                            <span class="label">${xAxes[idx].name}:</span>
                                            <span class="value">${value.label}</span>
                                        </div>
                                        <div class="axis-values">
                                            ${value.content.join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('');

                            return `
                                <div class="dataset-dimension-series-tooltip">
                                    ${items}
                                </div>
                            `;
                        },
                        textStyle: {
                            fontSize: 13
                        },
                        axisPointer: {
                            type: 'line',
                            snap: true
                        }
                    },
                    xAxis: xAxes,
                    yAxis: yAxes,
                    grid: {
                        left: 40,
                        right: 40,
                        bottom: 30,
                        top: 60,
                        containLabel: true
                    },
                    series: chartSeries,
                    useUTC: true,
                    backgroundColor: 'transparent'
                } as EChartOption}
                isLoading={loadingState === LoadingState.Loading}
            />
        </div>
    );
}
