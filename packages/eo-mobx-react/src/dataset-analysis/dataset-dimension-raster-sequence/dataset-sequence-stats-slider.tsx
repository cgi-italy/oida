import React from 'react';
import moment from 'moment';
import { EChartOption } from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import 'echarts/lib/component/brush';

import {
    isDomainProvider, NumericDomainMapper, DatasetRasterSequenceItem, RasterBandConfig, DatasetDimension, DataDomain, isValueDomain
} from '@oida/eo-mobx';

import { ChartWidget } from '../chart-widget';


export type DatasetRasterSequenceStatsSliderProps = {
    data: DatasetRasterSequenceItem[];
    variableConfig: RasterBandConfig;
    dimensionConfig: DatasetDimension<DataDomain<number | Date | string>>;
    activeItem: number;
    onActiveItemChange: (active: number) => void;
    color?: string;
    isLoading?: boolean;
};

export const DatasetRasterSequenceStatsSlider = (props: DatasetRasterSequenceStatsSliderProps) => {

    const variableDomain = props.variableConfig.domain;

    const domainMapper = new NumericDomainMapper({
        domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
        unitsSymbol: props.variableConfig.units
    });

    const chartMinData: Array<number[]> = [];
    const chartMaxData: Array<number[]> = [];
    const chartMeanData: Array<number[]> = [];
    const chartMeanPlusSigmaData: Array<number[]> = [];
    const chartMeanMinusSigmaData: Array<number[]> = [];

    props.data.forEach((item) => {
        if (item.stats) {
            if (item.stats.min !== undefined) {
                const scaledMin = domainMapper.normalizeValue(item.stats.min!);
                if (scaledMin !== undefined) {
                    chartMinData.push([item.x as number, scaledMin]);
                }
            }
            if (item.stats.max !== undefined) {
                const scaledMax = domainMapper.normalizeValue(item.stats.max);
                if (scaledMax !== undefined) {
                    chartMaxData.push([item.x as number, scaledMax]);
                }
            }
            if (item.stats.mean !== undefined) {
                const scaledMean = domainMapper.normalizeValue(item.stats.mean);
                if (scaledMean !== undefined) {
                    chartMeanData.push([item.x as number, scaledMean]);
                    if (item.stats.variance) {
                        const scaledVariance = Math.sqrt(item.stats.variance) * domainMapper.domainScalingFactor;
                        chartMeanPlusSigmaData.push([item.x as number, scaledMean + scaledVariance]);
                        chartMeanMinusSigmaData.push([item.x as number, scaledMean - scaledVariance]);
                    }
                }

            }
        }
    });

    let axisType: string;
    if (props.dimensionConfig.id === 'time') {
        axisType = 'time';
    } else {
        axisType = (
            props.dimensionConfig.domain && !isDomainProvider(props.dimensionConfig.domain) && isValueDomain(props.dimensionConfig.domain)
        ) ? 'value'
          : 'category';
    }

    const axisFormatter = props.dimensionConfig.id === 'time' ? (value) => {
        return moment.utc(value).format('YYYY-MM-DD');
    } : undefined;

    return (
        <div className='dataset-sequence-stats-slider'>
            <ChartWidget
                options={{
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
                    xAxis: [{
                        type: axisType,
                        name: `${props.dimensionConfig.name} ${props.dimensionConfig.units ? `(${props.dimensionConfig.units})` : ''}`,
                        nameLocation: 'middle',
                        axisLabel: {
                            formatter: axisFormatter
                        },
                        nameGap: 25,
                        axisLine: {
                            onZero: false
                        },
                        axisPointer: {
                            value: props.data[props.activeItem].x,
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
                                margin: 35
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        nameLocation: 'end',
                        name: `${props.variableConfig.name} ${props.variableConfig.units ? `(${props.variableConfig.units})` : ''}`,
                        nameGap: 10,
                        nameTextStyle: {
                            align: 'left'
                        },
                        axisLine: {
                            onZero: false
                        },
                        scale: true
                    }],
                    grid: {
                        left: 20,
                        right: 40,
                        bottom: 50,
                        top: 30,
                        containLabel: true
                    },
                    series: [{
                        type: 'line',
                        smooth: true,
                        data: chartMinData,
                        itemStyle: {
                            color: props.color
                        },
                        lineStyle: {
                            color: props.color,
                            width: 2
                        },
                        areaStyle: {
                            //TODO: this should be equal to the chart background color
                            color: '#333333',
                            origin: 'start',
                            opacity: 1
                        },
                        z: -1,
                        showSymbol: false
                    }, {
                        type: 'line',
                        smooth: true,
                        data: chartMaxData,
                        itemStyle: {
                            color: props.color
                        },
                        lineStyle: {
                            color: props.color,
                            width: 2
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
                        smooth: true,
                        data: chartMeanData,
                        itemStyle: {
                            color: props.color
                        },
                        symbolSize: 6,
                        lineStyle: {
                            width: 3
                        }
                    }, {
                        type: 'line',
                        smooth: true,
                        data: chartMeanMinusSigmaData,
                        itemStyle: {
                            color: props.color
                        },
                        lineStyle: {
                            width: 1.5,
                            type: 'dotted'
                        },
                        showSymbol: false
                    }, {
                        type: 'line',
                        smooth: true,
                        data: chartMeanPlusSigmaData,
                        itemStyle: {
                            color: props.color
                        },
                        lineStyle: {
                            width: 1.5,
                            type: 'dotted'
                        },
                        showSymbol: false
                    }],
                    backgroundColor: 'transparent'
                } as EChartOption}
                isLoading={props.isLoading}
            />
        </div>
    );
};

