import React from 'react';
import moment from 'moment';
import { EChartOption } from 'echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import 'echarts/lib/component/dataZoom';

import { LoadingState } from '@oidajs/core';
import { DatasetPointSeries, DatasetDimension, isValueDomain, DataDomain, isDomainProvider, NumericDomainMapper } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';

export type DatasetPointSeriesChartProps = {
    series: DatasetPointSeries[];
    smooth?: boolean;
};

type LegendDataItem = {
    id: string;
    name: string;
    type: 'point' | 'area';
    disabled?: boolean;
    hovered?: boolean;
    description?: string;
};

export function DatasetPointSeriesChart(props: DatasetPointSeriesChartProps) {
    const { chartSeries, colors, loadingState, errorMessage, legendData, axes } = useSelector(() => {
        const chartSeries: EChartOption.SeriesLine[] = [];
        const colors: string[] = [];

        let loadingState = LoadingState.Init;
        let errorMessage: string | undefined;

        const legendData: LegendDataItem[] = [];

        const axes = {
            x: {},
            y: {}
        };

        let nextXAxisIndex = 0;
        let nextYAxisIndex = 0;

        props.series.forEach((series, idx) => {
            if (series.loadingState.value === LoadingState.Init) {
                return;
            }

            const variable = series.seriesVariable;
            if (!variable) {
                return;
            }

            const variableConfig = series.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return;
            }

            const variableDomain = variableConfig.domain;
            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

            const dimension = series.seriesDimension;

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
                    axisType =
                        dimensionConfig.domain && !isDomainProvider(dimensionConfig.domain) && isValueDomain(dimensionConfig.domain)
                            ? 'value'
                            : 'category';
                }
                axes.x[dimensionConfig.id] = {
                    idx: nextXAxisIndex++,
                    label: `${dimensionConfig.name} ${dimensionConfig.units ? `(${dimensionConfig.units})` : ''}`,
                    type: axisType
                };
            }

            const yAxisUnits = variableConfig.units || variableConfig.id;
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
            } else if (series.loadingState.value === LoadingState.Error && loadingState !== LoadingState.Success) {
                loadingState = LoadingState.Error;
                errorMessage = series.loadingState.message;
            }

            let description = `
                <div>
                    <div><span>Dataset:</span><span> ${series.dataset.config.name}</span>
                    <div><span>Variable:</span><span> ${variableConfig.name}</span>
            `;
            series.dimensions.values.forEach((value, key) => {
                const dimensionConfig = series.config.dimensions.find((d) => d.id === key);
                if (dimensionConfig) {
                    let stringValue = value.toString();
                    if (value instanceof Date) {
                        stringValue = moment(value).format('YYYY-MM-DD HH:mm');
                    }
                    description += `<div><span>${dimensionConfig.name}:</span><span> ${stringValue}</span></div>`;
                }
            });

            if (series.geometry?.type === 'Point') {
                description += `<div><span>Location:</span><span> Lat: ${series.geometry.coordinates[0].toFixed(
                    3
                )}, Lon: ${series.geometry.coordinates[1].toFixed(3)}`;
            }
            description += '</div>';

            colors.push(series.color);
            legendData[idx] = {
                id: `${idx}`,
                type: 'point',
                name: `${series.dataset.config.name}: ${variableConfig.name}`,
                disabled: !series.visible.value,
                hovered: series.hovered.value,
                description: description
            };

            const chartData: Array<number[]> = [];
            series.data.forEach((item) => {
                const scaledY = domainMapper.normalizeValue(item.y);
                if (scaledY !== undefined) {
                    chartData.push([item.x as number, scaledY]);
                }
            });

            chartSeries.push({
                type: 'line',
                name: `${idx}`,
                xAxisIndex: axes.x[dimensionConfig.id].idx,
                yAxisIndex: axes.y[yAxisUnits].idx,
                data: chartData
            });
        });

        return { chartSeries, colors, legendData, loadingState, errorMessage, axes };
    });

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                errorMessage={errorMessage}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    }

    const yAxes = Object.keys(axes.y).map((axisUnits, idx) => {
        return {
            type: 'value',
            name: axes.y[axisUnits].label,
            nameLocation: 'end',
            position: idx % 2 ? 'right' : 'left',
            nameGap: 20,
            width: '100px',
            offset: Math.floor(idx / 2) * 60,
            axisLine: {
                onZero: false
            },
            scale: true
        };
    });

    const xAxes = Object.keys(axes.x).map((dimensionId) => {
        return {
            type: axes.x[dimensionId].type,
            name: axes.x[dimensionId].label,
            axisLabel: {
                formatter:
                    axes.x[dimensionId].type === 'time'
                        ? (value) => {
                              return moment.utc(value).format('YYYY-MM-DD');
                          }
                        : undefined
            },
            nameLocation: 'middle',
            nameGap: 30,
            axisLine: {
                onZero: false
            }
        };
    });

    const highlightedSeries = legendData.findIndex((item) => item.hovered);

    return (
        <div className='series-chart'>
            <ChartWidget
                options={
                    {
                        color: colors,
                        legend: {
                            data: legendData.map((item) => item.id),
                            right: '10px',
                            formatter: (name) => {
                                return legendData[name].name;
                            },
                            tooltip: {
                                show: true,
                                formatter: (data: EChartOption.Tooltip.Format) => {
                                    return legendData[data.name!].description || '';
                                }
                            },
                            selected: legendData.reduce((selected, item) => {
                                return {
                                    ...selected,
                                    [item.id]: !item.disabled
                                };
                            }, {})
                        },
                        dataZoom: [
                            {
                                xAxisIndex: xAxes.map((axis, idx) => idx),
                                type: 'inside',
                                id: '0'
                            },
                            {
                                xAxisIndex: xAxes.map((axis, idx) => idx),
                                type: 'slider',
                                dataBackground: {
                                    lineStyle: {
                                        opacity: 1,
                                        color: 'white'
                                    }
                                },
                                id: '1'
                            }
                        ],
                        tooltip: {
                            trigger: 'axis',
                            transitionDuration: 0,
                            formatter: (series: EChartOption.Tooltip.Format[]) => {
                                const axisValues: Array<{ label: string; content: string[] }> = [];
                                let idx = 0;
                                while (idx < series.length) {
                                    const data = series[idx];
                                    const seriesInfo = legendData[parseInt(data.seriesName!)];
                                    const seriesContent = `
                                    <div class="series-item is-point">
                                        <span>${data.marker}</span>
                                        <span class="label">${seriesInfo.name}:</span>
                                        <span class="value">${data.data[1].toFixed(2)}</span>
                                    </div>`;
                                    idx++;

                                    const axisIndex = (data as any).axisIndex;

                                    const value = axisValues[axisIndex] || {
                                        label: data.axisValueLabel,
                                        content: []
                                    };
                                    value.content.push(seriesContent);

                                    axisValues[axisIndex] = value;
                                }
                                const items = axisValues
                                    .map((value, idx) => {
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
                                    })
                                    .join('');

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
                            bottom: 60,
                            top: 60,
                            containLabel: true
                        },
                        series: chartSeries.map((series) => {
                            return {
                                ...series,
                                smooth: props.smooth
                            };
                        }),
                        useUTC: true,
                        backgroundColor: 'transparent'
                    } as EChartOption
                }
                onHighlight={(evt, highlighted) => {
                    if (evt.seriesName) {
                        const series = props.series[parseInt(evt.seriesName)];
                        if (series) {
                            series.hovered.setValue(highlighted || false);
                        }
                    }
                }}
                onLegendItemSelection={(evt) => {
                    for (const idx in evt.selected) {
                        props.series[parseInt(idx)].visible.setValue(evt.selected[idx]);
                    }
                }}
                highlightedSeries={highlightedSeries !== -1 ? highlightedSeries : undefined}
                isLoading={loadingState === LoadingState.Loading}
            />
        </div>
    );
}
