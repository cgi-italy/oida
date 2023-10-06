import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Checkbox, Empty, Segmented, Space, theme } from 'antd';
import { PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts/core';
import { PieChart, PieSeriesOption, BarChart, BarSeriesOption } from 'echarts/charts';
import {
    TitleComponent,
    TitleComponentOption,
    TooltipComponent,
    TooltipComponentOption,
    GridComponent,
    GridComponentOption,
    LegendComponent,
    LegendComponentOption,
    DatasetComponentOption,
    DatasetComponent
} from 'echarts/components';
import { UniversalTransition } from 'echarts/features';

import { AreaUnit, capitalizeString, formatArea, formatNumber, LoadingState, randomColorFactory } from '@oidajs/core';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaDistribution, DatasetAreaDistributionMode, ENUM_FEATURE_PROPERTY_TYPE, SharedAoi } from '@oidajs/eo-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';

export type DatasetAreaDistributionProcessingProps = {
    processings: DatasetAreaDistribution[];
    actionContainer: React.RefObject<HTMLDivElement | null>;
};

type DistributionChartOption = echarts.ComposeOption<
    | PieSeriesOption
    | BarSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | LegendComponentOption
    | DatasetComponentOption
>;

echarts.use([PieChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, DatasetComponent, UniversalTransition]);

type ProcessingChartData = {
    id: string;
    title: string;
    loadingState: LoadingState;
    xAxis: {
        id: string;
        name: string;
        values: string[];
        colors: string[];
    };
    yAxes: Array<{
        id: string;
        name: string;
        valueFormatter: (value: number) => string;
    }>;
    series: Array<{
        id: string;
        name: string;
        yAxisIndex: number;
        color: string;
        data: number[];
        processingParams: {
            dataset: string;
            xVar: string;
            yVar: string;
            aggregation?: string;
            aoi?: SharedAoi;
        };
    }>;
};

/**
 * Extract chart data from a distribution processing instance
 * @param processing The distribution processing
 * @returns The chart data to plot
 */
const getChartDataForProcessing = (processing: DatasetAreaDistribution): ProcessingChartData | undefined => {
    let chartData: ProcessingChartData | undefined;

    const countFormatter = (value) => {
        return formatNumber(value, {
            maxLength: 6,
            precision: 3
        });
    };

    const areaFormatter = (value) => {
        return formatArea(value, {
            inputUnits: AreaUnit.KM2,
            outputUnits: AreaUnit.KM2,
            appendUnits: true,
            precision: 3
        });
    };
    if (processing.currentMode === DatasetAreaDistributionMode.EnumCount) {
        const groupDescriptor = processing.variableDescriptor;
        if (groupDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE) {
            const measureType = processing.measureType || 'count';

            const randomColor = randomColorFactory();

            chartData = {
                id: processing.id,
                loadingState: processing.loadingState.value,
                title: processing.name,
                xAxis: {
                    id: groupDescriptor.quantity?.id || groupDescriptor.id,
                    name: groupDescriptor.quantity?.name || groupDescriptor.name,
                    colors: groupDescriptor.options.map((option) => option.color || randomColor()),
                    values: groupDescriptor.options.map((option) => option.name)
                },
                yAxes: [
                    {
                        id: measureType,
                        name: capitalizeString(measureType),
                        valueFormatter: measureType === 'area' ? areaFormatter : countFormatter
                    }
                ],
                series: [
                    {
                        id: processing.id,
                        name: capitalizeString(measureType),
                        color: processing.color,
                        yAxisIndex: 0,
                        processingParams: {
                            dataset: processing.dataset.config.name,
                            aoi: processing.aoi,
                            xVar: groupDescriptor.name,
                            yVar: capitalizeString(measureType)
                        },
                        data: groupDescriptor.options.map((option) => {
                            let total = (processing.data?.totals[option.value] || 0) as number;
                            if (measureType === 'area') {
                                total = parseFloat(
                                    formatArea(total, {
                                        inputUnits: AreaUnit.METERS2,
                                        outputUnits: AreaUnit.KM2
                                    })
                                );
                            }
                            return total;
                        })
                    }
                ]
            };
        }
    } else if (processing.currentMode === DatasetAreaDistributionMode.NumericGroupByEnum) {
        const groupDescriptor = processing.groupByVariableDescriptor;
        if (groupDescriptor?.type == ENUM_FEATURE_PROPERTY_TYPE) {
            const measureType = processing.aggregationMethod || 'sum';
            const randomColor = randomColorFactory();

            const measuredQuantity = processing.variableDescriptor!.quantity || processing.variableDescriptor!;

            chartData = {
                id: processing.id,
                loadingState: processing.loadingState.value,
                title: processing.name,
                xAxis: {
                    id: groupDescriptor.quantity?.id || groupDescriptor.id,
                    name: groupDescriptor.quantity?.name || groupDescriptor.name,
                    colors: groupDescriptor.options.map((option) => option.color || randomColor()),
                    values: groupDescriptor.options.map((option) => option.name)
                },
                yAxes: [
                    {
                        id: measuredQuantity.id,
                        name: measuredQuantity.name || measuredQuantity.id,
                        valueFormatter: countFormatter
                    }
                ],
                series: [
                    {
                        id: processing.id,
                        name: capitalizeString(measureType),
                        color: processing.color,
                        processingParams: {
                            dataset: processing.dataset.config.name,
                            xVar: groupDescriptor.name,
                            yVar: processing.variableDescriptor!.name,
                            aoi: processing.aoi,
                            aggregation: capitalizeString(processing.aggregationMethod)
                        },
                        yAxisIndex: 0,
                        data: groupDescriptor.options.map((option) => {
                            const total = processing.data?.totals[option.value] || 0;
                            return total as number;
                        })
                    }
                ]
            };
        }
    } else if (processing.currentMode === DatasetAreaDistributionMode.EnumGroupByEnum) {
        const groupDescriptor = processing.groupByVariableDescriptor;
        const variableDescriptor = processing.variableDescriptor;
        if (groupDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE && variableDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE) {
            const randomColor = randomColorFactory();
            const measureType = processing.measureType || 'count';

            chartData = {
                id: processing.id,
                loadingState: processing.loadingState.value,
                title: processing.name,
                xAxis: {
                    id: groupDescriptor.quantity?.id || groupDescriptor.id,
                    name: groupDescriptor.name,
                    colors: groupDescriptor.options.map((option) => option.color || randomColor()),
                    values: groupDescriptor.options.map((option) => option.name)
                },
                yAxes: [
                    {
                        id: measureType,
                        name: capitalizeString(measureType),
                        valueFormatter: measureType === 'area' ? areaFormatter : countFormatter
                    }
                ],
                series: variableDescriptor.options.map((option) => {
                    const values = (processing.data?.totals || {}) as Record<string, Record<string, number>>;
                    const totals = groupDescriptor.options.map((group) => {
                        return (values[group.value] || {})[option.value] || 0;
                    });
                    return {
                        id: `${processing.id}_${option.value}`,
                        name: option.name,
                        color: option.color || randomColor(),
                        processingParams: {
                            dataset: processing.dataset.config.name,
                            xVar: groupDescriptor.name,
                            yVar: capitalizeString(measureType),
                            aoi: processing.aoi
                        },
                        yAxisIndex: 0,
                        data: totals
                    };
                })
            };
        }
    }

    return chartData;
};

/**
 * A function that combines charts
 * @param charts
 * @returns
 */
const combineChartData = (charts: ProcessingChartData[]) => {
    const combinedDataMap: Record<string, ProcessingChartData> = {};
    const multiSeries: ProcessingChartData[] = [];

    charts.forEach((chart, idx) => {
        if (chart.series.length > 1) {
            // multi series chart (i.e. enum group by enum are never combined)
            multiSeries.push(chart);
        } else {
            // other charts are combined if they share the same x axis
            const combinedData = combinedDataMap[chart.xAxis.name];
            if (!combinedData) {
                combinedDataMap[chart.xAxis.name] = chart;
            } else {
                const chartYAxis = chart.yAxes[0];
                const chartSeries = chart.series[0];
                let yAxisIndex = combinedData.yAxes.findIndex((axis) => axis.id === chartYAxis.id);
                if (yAxisIndex === -1) {
                    // the chart will have multiple y axes
                    combinedData.yAxes.push(chartYAxis);
                    yAxisIndex = combinedData.yAxes.length - 1;
                }
                combinedData.series.push({
                    ...chartSeries,
                    yAxisIndex: yAxisIndex
                });
                if (chart.loadingState === LoadingState.Loading) {
                    combinedData.loadingState = LoadingState.Loading;
                }
            }
        }
    });

    const combinedCharts = Object.values(combinedDataMap);
    combinedCharts.forEach((combinedChart) => {
        // compute combined chart title and series names
        let sameDataset = true;
        let sameXVar = true;
        let sameYVar = true;
        let sameAoi = true;
        let sameAggregation = true;
        combinedChart.series.slice(1).forEach((series, idx) => {
            const prevSeriesParams = combinedChart.series[idx].processingParams;
            if (prevSeriesParams.xVar !== series.processingParams.xVar) {
                sameXVar = false;
            }
            if (prevSeriesParams.yVar !== series.processingParams.yVar) {
                sameYVar = false;
            }
            if (prevSeriesParams.dataset !== series.processingParams.dataset) {
                sameDataset = false;
            }
            if (prevSeriesParams.aoi !== series.processingParams.aoi) {
                sameAoi = false;
            }
            if (prevSeriesParams.aggregation !== series.processingParams.aggregation) {
                sameAggregation = false;
            }
        });

        // build the title with the parameters shared across all series
        combinedChart.title = '';
        const referenceParams = combinedChart.series[0].processingParams;
        if (sameDataset) {
            combinedChart.title += referenceParams.dataset;
        }
        if (sameYVar) {
            let variableName = referenceParams.yVar;
            if (combinedChart.title) {
                variableName = `: ${variableName}`;
            }
            combinedChart.title += variableName;
            combinedChart.yAxes[0].name = referenceParams.yVar;

            if (sameAggregation && referenceParams.aggregation) {
                let aggregation = referenceParams.aggregation;
                if (combinedChart.title) {
                    aggregation = ` (${aggregation})`;
                }
                combinedChart.title += aggregation;
            }
        }

        if (sameAoi && referenceParams.aoi) {
            let aoiName = referenceParams.aoi.name;
            if (combinedChart.title) {
                aoiName = ` (${aoiName})`;
            }
            combinedChart.title += aoiName;
        }

        if (sameXVar) {
            combinedChart.xAxis.name = referenceParams.xVar;
        }

        // all the rest goes in the series name
        combinedChart.series.forEach((series, idx) => {
            series.name = '';
            if (!sameDataset) {
                series.name = series.processingParams.dataset;
            }
            if (!sameYVar) {
                series.name += `${series.name ? ': ' : ''}${series.processingParams.yVar}`;

                if (sameAggregation && series.processingParams.aggregation) {
                    series.name += ` (${series.processingParams.aggregation})`;
                }
            }
            if (!sameAggregation && series.processingParams.aggregation) {
                let aggregation = series.processingParams.aggregation;
                if (series.name) {
                    aggregation = ` (${aggregation})`;
                }
                series.name += aggregation;
            }
            if (!sameXVar) {
                series.name += `${series.name ? ': ' : ''}${series.processingParams.xVar}`;
            }

            if (!sameAoi) {
                let aoiName = `${series.processingParams.aoi?.name || 'Overall'}`;
                if (series.name) {
                    aoiName = ` (${aoiName})`;
                }
                series.name += aoiName;
            }
        });
    });

    return [...combinedCharts, ...multiSeries];
};

export const DatasetAreaValuesProcessingChart = (props: DatasetAreaDistributionProcessingProps) => {
    const chartData = useSelector(() => {
        const charts = props.processings
            .map((processing) => getChartDataForProcessing(processing))
            .filter((data) => !!data) as ProcessingChartData[];
        return combineChartData(charts);
    });

    const [mode, setMode] = useState<'pie' | 'bar'>('bar');
    const [barStack, setBarStack] = useState(false);

    const hasStackableCharts = useMemo(() => chartData.some((chart) => chart.series.length > chart.yAxes.length), [chartData]);

    let actions: React.ReactPortal | undefined = undefined;
    if (props.actionContainer.current) {
        actions = createPortal(
            <Space>
                {mode === 'bar' && hasStackableCharts && (
                    <Checkbox checked={barStack} onChange={(evt) => setBarStack(evt.target.checked)}>
                        Stack
                    </Checkbox>
                )}
                <Segmented
                    options={[
                        {
                            value: 'pie',
                            icon: <PieChartOutlined />
                        },
                        {
                            value: 'bar',
                            icon: <BarChartOutlined />
                        }
                    ]}
                    value={mode}
                    onChange={(value) => setMode(value as 'pie' | 'bar')}
                />
            </Space>,
            props.actionContainer.current
        );
    }

    const charts = chartData.map((chartData) => (
        <DatasetAreaValuesProcessingChartSingle key={chartData.id} chartData={chartData} barStack={barStack} mode={mode} />
    ));
    return (
        <div className='dataset-area-distribution'>
            {actions}
            <div className='dataset-area-distribution-charts' style={{ minHeight: 300 * charts.length }}>
                {charts}
            </div>
        </div>
    );
};

const getChartConfig = (
    data: ProcessingChartData,
    mode: 'bar' | 'pie',
    chartSize: { width: number; height: number },
    primaryColor: string,
    barStack?: boolean
) => {
    let chartConfig: DistributionChartOption = {
        backgroundColor: 'transparent',
        dataset: {
            source: data.xAxis.values.map((value, idx) => {
                return [value, ...data.series.map((series) => series.data[idx])];
            }),
            dimensions: [
                data.title,
                ...data.series.map((series) => {
                    return series.name;
                })
            ]
        },
        legend: {
            textStyle: {
                width: chartSize.width / 3,
                overflow: 'truncate'
            }
        }
    };

    if (mode === 'bar') {
        chartConfig = {
            ...chartConfig,
            xAxis: {
                type: 'category',
                name: data.xAxis.name,
                nameLocation: 'middle',
                nameGap: 60,
                axisLabel: {
                    interval: 0,
                    overflow: 'truncate',
                    width: 100,
                    rotate: 30
                }
            },
            yAxis: data.yAxes.map((axis) => {
                return {
                    type: 'value',
                    name: axis.name,
                    nameGap: 10,
                    axisLabel: {
                        formatter: (value) => {
                            return formatNumber(value, {
                                precision: 3,
                                maxLength: 6
                            });
                        }
                    }
                };
            }),
            series: data.series.map((series) => {
                const valueFormatter = data.yAxes[series.yAxisIndex].valueFormatter;
                return {
                    id: series.id,
                    name: series.name,
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: series.yAxisIndex,
                    emphasis: { focus: 'series', blurScope: 'global' },
                    stack: barStack ? data.yAxes[series.yAxisIndex].id : undefined,
                    color: series.color,
                    universalTransition: {
                        enabled: true
                    },
                    tooltip: {
                        valueFormatter: (value) => {
                            return valueFormatter((value || 0) as number);
                        }
                    }
                };
            }),
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                confine: true
            },
            grid: [
                {
                    containLabel: true,
                    top: 70,
                    bottom: 30
                }
            ]
        };
    } else {
        const numSeries = data.series.length;
        const topMargin = 50;
        const minRadius = 300;
        const gridXSize = Math.min(Math.floor(chartSize.width / minRadius), numSeries);

        const gridYSize = Math.ceil(numSeries / gridXSize);
        const itemSize = [Math.floor(chartSize.width / gridXSize), Math.floor((chartSize.height - topMargin) / gridYSize)];
        const radius = Math.min(itemSize[0], itemSize[1]) * 0.25;

        chartConfig = {
            ...chartConfig,
            title: data.series.map((series, idx) => {
                const gridXIndex = idx % gridXSize;
                const gridYIndex = Math.floor(idx / gridXSize);

                return {
                    text: series.name,
                    left: itemSize[0] / 2 + itemSize[0] * gridXIndex,
                    top: topMargin + itemSize[1] / 2 + itemSize[1] * gridYIndex,
                    textStyle: {
                        width: radius * 2,
                        overflow: 'truncate',
                        fontSize: 14,
                        textBorderColor: 'black',
                        textBorderWidth: 2
                    },
                    textAlign: 'center'
                };
            }),
            tooltip: {
                trigger: 'item'
            },
            series: data.series.map((series, idx) => {
                const gridXIndex = idx % gridXSize;
                const gridYIndex = Math.floor(idx / gridXSize);
                const valueFormatter = data.yAxes[series.yAxisIndex].valueFormatter;
                return {
                    id: series.id,
                    name: series.name,
                    type: 'pie',
                    radius: radius,
                    showEmptyCircle: false,
                    color: data.xAxis.colors,
                    tooltip: {
                        formatter: (item) => {
                            return `${item.seriesName}<br/>${item.name}: ${valueFormatter!(item.value[idx + 1] || 0)} (${item.percent})%`;
                        }
                    },
                    center: [itemSize[0] / 2 + itemSize[0] * gridXIndex, topMargin + itemSize[1] / 2 + itemSize[1] * gridYIndex],
                    minShowLabelAngle: 0.1,
                    label: {
                        formatter: (item) => {
                            const label = [`{b|${item.name}:}`, `{per|${valueFormatter!(item.value[idx + 1] || 0)} (${item.percent}%)}`];
                            if (numSeries > 1) {
                                label.splice(0, 1);
                            }
                            return label.join('\n');
                        },
                        width: itemSize[0] * 0.2,
                        overflow: 'truncate',
                        fontSize: 15,
                        color: primaryColor,
                        rich: {
                            per: {
                                padding: [0, 0, 8, 0],
                                color: primaryColor,
                                lineHeight: 22,
                                align: 'center',
                                fontSize: 14,
                                fontWeight: 'bold'
                            },
                            b: {
                                color: '#FFFFFF',
                                lineHeight: 22,
                                align: 'center',
                                fontSize: 13
                            },
                            c: {
                                color: '#FFFFFF',
                                lineHeight: 22,
                                align: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        }
                    },
                    universalTransition: {
                        enabled: true
                    },
                    encode: {
                        itemName: data.title,
                        value: series.name
                    }
                };
            })
        };
    }

    return chartConfig;
};

export type DatasetAreaValuesProcessingChartSingleProps = {
    chartData: ProcessingChartData;
    mode: 'bar' | 'pie';
    barStack: boolean;
};

export const DatasetAreaValuesProcessingChartSingle = (props: DatasetAreaValuesProcessingChartSingleProps) => {
    const { token } = theme.useToken();

    const { chartData, mode, barStack } = props;

    const [chartSize, setChartSize] = useState({ width: 100, height: 100 });

    if (!chartData || chartData.loadingState === LoadingState.Init || chartData.loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={chartData?.loadingState || LoadingState.Error}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    } else if (chartData.loadingState == LoadingState.Success && !chartData.series.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No data found' />;
    }

    const options = getChartConfig(chartData, mode, chartSize, token.colorPrimary, barStack);

    const chart = (
        <ChartWidget<DistributionChartOption>
            options={options}
            onSizeChange={(size) => setChartSize(size)}
            isLoading={chartData.loadingState === LoadingState.Loading}
        ></ChartWidget>
    );

    return (
        <div className='series-chart'>
            <div className='series-chart-title'>{chartData.title}</div>
            {chart}
        </div>
    );
};
