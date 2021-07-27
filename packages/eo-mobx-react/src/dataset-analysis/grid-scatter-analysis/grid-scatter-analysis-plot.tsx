import React from 'react';

import { EChartOption } from 'echarts';
import 'echarts/lib/chart/scatter';

import { LoadingState } from '@oida/core';
import { GridScatterAnalysis, isDomainProvider, NumericDomainMapper } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';
import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';


export type GridScatterAnalysisPlotProps = {
    gridScatter: GridScatterAnalysis
};

export const GridScatterAnalysisPlot = (props: GridScatterAnalysisPlotProps) => {

    const {xAxes, yAxes, chartSeries, loadingState } = useSelector(() => {

        const chartSeries: EChartOption.SeriesScatter[] = [];

        const xAxes: EChartOption.XAxis[] = [];
        const yAxes: EChartOption.YAxis[]  = [];

        let loadingState = LoadingState.Init;

        const xAnalysis = props.gridScatter.xAxisAnalysis;
        const yAnalysis = props.gridScatter.yAxisAnalysis;

        if (xAnalysis && yAnalysis) {
            const xData = xAnalysis.data?.gridValues;
            const yData = yAnalysis.data?.gridValues;

            if (xData && yData) {
                const xVariableConfig = xAnalysis.config.variables.find((variable) => variable.id === xAnalysis.variable);
                const yVariableConfig = yAnalysis.config.variables.find((variable) => variable.id === yAnalysis.variable);

                if (xVariableConfig && yVariableConfig) {
                    xAxes.push({
                        type: 'value',
                        gridIndex: 0,
                        name: `${xVariableConfig.name} ${xVariableConfig.units ? `(${xVariableConfig.units})` : ''}`,
                        nameLocation: 'middle',
                        nameGap: 25,
                        axisLine: {
                            onZero: false
                        }
                    });

                    yAxes.push({
                        type: 'value',
                        gridIndex: 0,
                        name: `${yVariableConfig.name} ${yVariableConfig.units ? `(${yVariableConfig.units})` : ''}`,
                        nameGap: 10
                    });

                    if (
                        xAnalysis.loadingState.value === LoadingState.Loading
                        || yAnalysis.loadingState.value === LoadingState.Loading
                    ) {
                        loadingState = LoadingState.Loading;
                    } else if (
                        xAnalysis.loadingState.value === LoadingState.Success
                        && yAnalysis.loadingState.value === LoadingState.Success
                    ) {
                        loadingState = LoadingState.Success;
                    } else if (
                        xAnalysis.loadingState.value === LoadingState.Error
                        || yAnalysis.loadingState.value === LoadingState.Error
                    ) {
                        loadingState = LoadingState.Error;
                    }

                    const xVariableDomain = xVariableConfig.domain;
                    const xDomainMapper = new NumericDomainMapper({
                        domain: xVariableDomain && !isDomainProvider(xVariableDomain) ? xVariableDomain : undefined,
                        unitsSymbol: xVariableConfig.units
                    });

                    const yVariableDomain = yVariableConfig.domain;
                    const yDomainMapper = new NumericDomainMapper({
                        domain: yVariableDomain && !isDomainProvider(yVariableDomain) ? yVariableDomain : undefined,
                        unitsSymbol: yVariableConfig.units
                    });

                    const scatterData = xData.reduce((data, value, idx) => {
                        const x = xDomainMapper.normalizeValue(value);
                        const y = yDomainMapper.normalizeValue(yData[idx]);

                        if (x !== undefined && y !== undefined) {
                            return [
                                ...data,
                                [x, y]
                            ];
                        } else {
                            return data;
                        }
                    }, [] as Array<number[]>);

                    chartSeries.push({
                        type: 'scatter',
                        name: `0`,
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        symbolSize: 6,
                        large: true,
                        data: scatterData
                    });
                }
            }
        }

        return {xAxes, yAxes, chartSeries, loadingState};

    });

    const color = useSelector(() => props.gridScatter.xAxisAnalysis?.color);

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    }

    return (
        <div className='series-chart'>
            <ChartWidget
                options={{
                    color: color ? [color] : undefined,
                    xAxis: xAxes,
                    yAxis: yAxes,
                    grid: {
                        left: 40,
                        right: 40,
                        bottom: 60,
                        top: 60,
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'item',
                        transitionDuration: 0,
                        formatter: (data) => {
                            //let seriesInfo = legendData[data.seriesIndex!];
                            if (!Array.isArray(data)) {
                                const seriesInfo = chartSeries[data.seriesIndex!];
                                return `
                                    <div class="dataset-dimension-series-tooltip">
                                        <div class="series-item is-point">
                                            <span>${data.marker}</span>
                                            <span class="value">${xAxes[seriesInfo.xAxisIndex!].name}: ${data.data[0].toFixed(2)}</span>
                                            <span class="value">${yAxes[seriesInfo.yAxisIndex!].name}: ${data.data[1].toFixed(2)}</span>
                                        </div>
                                    </div>
                                `;
                            } else {
                                return '';
                            }
                        }
                    },
                    animation: false,
                    dataZoom: [{
                        xAxisIndex: 0,
                        type: 'inside'
                    }, {
                        xAxisIndex: 0,
                        type: 'slider',
                        // @ts-ignore (wrong echarts typing)
                        showDataShadow: false
                    }, {
                        yAxisIndex: 0,
                        type: 'inside'
                    }, {
                        yAxisIndex: 0,
                        type: 'slider',
                        // @ts-ignore (wrong echarts typing)
                        showDataShadow: false
                    }],
                    series: chartSeries,
                    backgroundColor: 'transparent'
                }}
                isLoading={loadingState === LoadingState.Loading}
            />
        </div>
    );
};
