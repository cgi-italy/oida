import React from 'react';

import { EChartOption } from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import 'echarts/lib/component/brush';

import {
    isDomainProvider, NumericDomainMapper, DatasetAreaSeriesDataItem, RasterBandConfig
} from '@oidajs/eo-mobx';

import { ChartWidget } from '../chart-widget';


export type DatasetAreaSeriesItemHistogramProps = {
    item: DatasetAreaSeriesDataItem;
    variableConfig: RasterBandConfig;
    color?: string;
    isLoading?: boolean;
};

export const DatasetAreaSeriesItemHistogram = (props: DatasetAreaSeriesItemHistogramProps) => {

    const histogramData = props.item.data.stats?.histogram;
    if (!histogramData) {
        return null;
    }

    const variableDomain = props.variableConfig.domain;

    const domainMapper = new NumericDomainMapper({
        domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
        unitsSymbol: props.variableConfig.units
    });

    return (
        <div className='dataset-sequence-item-histogram'>
            <ChartWidget
                options={{
                    color: props.color ? [props.color] : undefined,
                    tooltip: {
                        trigger: 'item',
                        transitionDuration: 0,
                        textStyle: {
                            fontSize: 13
                        },
                        formatter: (item: EChartOption.Tooltip.Format) => {
                            return item.value ? `
                                <div>
                                    <div>${item.dimensionNames![0]} range: ${item.value[2]} to ${item.value[3]}</div>
                                    <div>Count: ${item.value ? item.value[1] : ''}</div>
                                </div>
                            ` : '';
                        }
                    },
                    xAxis: [{
                        type: 'category',
                        name: `${props.variableConfig.name} ${props.variableConfig.units ? `(${props.variableConfig.units})` : ''}`,
                        nameLocation: 'middle',
                        nameGap: 25,
                        axisLine: {
                            onZero: true
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        name: 'Count',
                        nameGap: 10
                    }],
                    series: [{
                        type: 'bar',
                        barWidth: '98%',
                        dimensions: [props.variableConfig.name, 'Count', 'min', 'max'],
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        data: histogramData.map((value) => {
                            return [
                                domainMapper.normalizeValue(value[0]),
                                value[1],
                                domainMapper.normalizeValue(value[2]),
                                domainMapper.normalizeValue(value[3])
                            ];
                        })
                    }],
                    grid: {
                        left: 10,
                        right: 10,
                        bottom: 30,
                        top: 30,
                        containLabel: true
                    },
                    backgroundColor: 'transparent'
                } as EChartOption}
                isLoading={props.isLoading}
            />
        </div>
    );
};

