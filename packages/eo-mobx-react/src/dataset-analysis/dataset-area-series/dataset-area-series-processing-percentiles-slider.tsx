import React from 'react';
import moment from 'moment';
import { EChartOption } from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import 'echarts/lib/component/brush';
import chroma from 'chroma-js';

import { formatNumber, getTextColorForBackground } from '@oidajs/core';
import {
    isDomainProvider,
    NumericDomainMapper,
    DatasetAreaSeriesDataItem,
    RasterBandConfig,
    DatasetDimension,
    DataDomain,
    isValueDomain
} from '@oidajs/eo-mobx';

import { ChartWidget } from '../chart-widget';

export type DatasetAreaSeriesProcessingPercentilesSliderProps = {
    items: DatasetAreaSeriesDataItem[];
    variableConfig: RasterBandConfig;
    dimensionConfig: DatasetDimension<DataDomain<number | Date | string>>;
    activeItem: number;
    onActiveItemChange: (active: number) => void;
    color?: string;
    isLoading?: boolean;
};

export const DatasetAreaSeriesProcessingPercentilesSlider = (props: DatasetAreaSeriesProcessingPercentilesSliderProps) => {
    const variableDomain = props.variableConfig.domain;

    const domainMapper = new NumericDomainMapper({
        domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
        unitsSymbol: props.variableConfig.units
    });

    const referenceItem = props.items.length ? props.items[0].data.stats?.percentiles : undefined;
    if (!referenceItem) {
        return null;
    }

    const min = Math.floor(
        props.items.reduce((min, item) => {
            const percentiles = item.data.stats?.percentiles;
            if (percentiles) {
                const scaledMin = domainMapper.normalizeValue(percentiles[0][1]);
                if (scaledMin) {
                    return Math.min(percentiles[0][1], min);
                }
            }
            return min;
        }, 0)
    );

    let prevAreaOpacity = 0;
    const chartSeries = referenceItem.map((percentile) => {
        const medianDistance = Math.abs(50 - percentile[0]) / 50;
        const areaOpacity = 0.2 + (1 - medianDistance) * 0.8;
        const series = {
            data: [] as Array<number[]>,
            width: 2 - 1.5 * medianDistance,
            lineColor: chroma(props.color!)
                .darken(2 * (1 - medianDistance))
                .hex(),
            areaOpacity: Math.min(areaOpacity, prevAreaOpacity),
            lineOpacity: 1 - medianDistance,
            showSymbols: medianDistance === 0
        };

        prevAreaOpacity = areaOpacity;
        return series;
    });

    props.items.forEach((item) => {
        const percentiles = item.data.stats?.percentiles;

        if (percentiles) {
            let prevValue = min;
            percentiles.forEach((percentile, idx) => {
                const scaledValue = domainMapper.normalizeValue(percentile[1]);
                if (scaledValue !== undefined) {
                    chartSeries[idx].data.push([item.x as number, scaledValue - prevValue]);
                    prevValue = scaledValue;
                }
            });
        }
    });

    let axisType: string;
    if (props.dimensionConfig.id === 'time') {
        axisType = 'time';
    } else {
        axisType =
            props.dimensionConfig.domain && !isDomainProvider(props.dimensionConfig.domain) && isValueDomain(props.dimensionConfig.domain)
                ? 'value'
                : 'category';
    }

    const axisFormatter =
        props.dimensionConfig.id === 'time'
            ? (value) => {
                  return moment.utc(value).format('YYYY-MM-DD');
              }
            : undefined;

    const handleTextColor = props.color ? getTextColorForBackground(props.color) : 'white';

    return (
        <div className='dataset-sequence-stats-slider'>
            <ChartWidget
                options={
                    {
                        color: props.color ? [props.color] : undefined,
                        tooltip: {
                            triggerOn: 'click',
                            transitionDuration: 0,
                            textStyle: {
                                fontSize: 13
                            },
                            formatter: (item: EChartOption.Tooltip.Format[]) => {
                                if (item && item.length) {
                                    props.onActiveItemChange(item[0].dataIndex!);
                                }
                                return '';
                            }
                        },
                        xAxis: [
                            {
                                type: axisType,
                                name: `${props.dimensionConfig.name} ${
                                    props.dimensionConfig.units ? `(${props.dimensionConfig.units})` : ''
                                }`,
                                nameLocation: 'middle',
                                axisLabel: {
                                    formatter: axisFormatter
                                },
                                nameGap: 25,
                                axisLine: {
                                    onZero: false
                                },
                                axisPointer: {
                                    value: props.items[props.activeItem].x,
                                    snap: true,
                                    handle: {
                                        show: true,
                                        color: props.color,
                                        size: 30,
                                        margin: 20
                                    },
                                    lineStyle: {
                                        color: props.color,
                                        width: 2
                                    },
                                    label: {
                                        show: true,
                                        formatter: axisFormatter ? (item) => axisFormatter(item.value) : undefined,
                                        backgroundColor: props.color,
                                        margin: 35,
                                        color: handleTextColor
                                    }
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                nameLocation: 'end',
                                name: `${props.variableConfig.name} ${props.variableConfig.units ? `(${props.variableConfig.units})` : ''}`,
                                nameGap: 10,
                                nameTextStyle: {
                                    align: 'left'
                                },
                                axisLabel: {
                                    formatter: (value) => {
                                        return formatNumber(value + min, {
                                            maxLength: 6
                                        });
                                    }
                                },
                                axisLine: {
                                    onZero: false
                                },
                                scale: true
                            }
                        ],
                        grid: {
                            left: 20,
                            right: 40,
                            bottom: 50,
                            top: 30,
                            containLabel: true
                        },
                        series: chartSeries.map((series, idx) => {
                            return {
                                type: 'line',
                                smooth: true,
                                data: series.data,
                                itemStyle: {
                                    color: series.lineColor
                                },
                                lineStyle: {
                                    color: series.lineColor,
                                    width: series.width,
                                    opacity: series.lineOpacity
                                },
                                areaStyle: {
                                    color: props.color,
                                    opacity: series.areaOpacity,
                                    origin: idx === 0 ? 'start' : 'auto'
                                },
                                showSymbol: series.showSymbols,
                                emphasis: {
                                    areaStyle: {
                                        opacity: 1
                                    }
                                },
                                symbolSize: 5,
                                z: chartSeries.length - idx,
                                stack: true
                            };
                        }),
                        dataZoom: [
                            {
                                xAxisIndex: 0,
                                type: 'inside',
                                filterMode: 'none',
                                id: '0'
                            },
                            {
                                yAxisIndex: 0,
                                type: 'inside',
                                filterMode: 'none',
                                id: '1'
                            },
                            {
                                xAxisIndex: 0,
                                type: 'slider',
                                filterMode: 'none',
                                dataBackground: {
                                    lineStyle: {
                                        opacity: 0,
                                        color: 'white'
                                    }
                                },
                                id: '2'
                            },
                            {
                                yAxisIndex: 0,
                                type: 'slider',
                                filterMode: 'none',
                                showDataShadow: false,
                                id: '3'
                            }
                        ],
                        backgroundColor: 'transparent'
                    } as EChartOption
                }
                isLoading={props.isLoading}
            />
        </div>
    );
};
