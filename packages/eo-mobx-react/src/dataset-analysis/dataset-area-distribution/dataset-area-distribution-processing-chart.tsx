import React, { useState } from 'react';
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
    LegendComponent,
    LegendComponentOption,
    DatasetComponentOption,
    DatasetComponent
} from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';

import { AreaUnit, capitalizeString, formatArea, formatNumber, LoadingState, randomColorFactory } from '@oidajs/core';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaDistribution, DatasetAreaDistributionMode, ENUM_FEATURE_PROPERTY_TYPE } from '@oidajs/eo-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';

export type DatasetAreaDistributionProcessingProps = {
    processings: DatasetAreaDistribution[];
    actionContainer: React.RefObject<HTMLDivElement | null>;
};

type AreaPieChartOption = echarts.ComposeOption<
    PieSeriesOption | BarSeriesOption | TitleComponentOption | TooltipComponentOption | LegendComponentOption | DatasetComponentOption
>;

echarts.use([PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, DatasetComponent, UniversalTransition]);

type ProcessingChartData = {
    processing: DatasetAreaDistribution;
    loadingState: LoadingState;
    valueFormatter?: (value: number) => string;
    dataset?: DatasetComponentOption;
    colors?: string[];
    secondaryColors?: string[];
    measure?: string;
};

const getChartDataForProcessing = (processing: DatasetAreaDistribution): ProcessingChartData => {
    const chartData: ProcessingChartData = {
        processing: processing,
        loadingState: processing.loadingState.value,
        valueFormatter: (value) => {
            return formatNumber(value, {
                precision: 3,
                maxLength: 6
            });
        }
    };

    const data = Object.entries(processing.data?.totals || []);

    if (data.length) {
        if (processing.data?.mode === DatasetAreaDistributionMode.EnumCount) {
            const groupDescriptor = processing.variableDescriptor;
            if (groupDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE) {
                const measureType = processing.data?.measureType || 'count';

                const randomColor = randomColorFactory();
                const colors: string[] = [];

                chartData.dataset = {
                    id: processing.id,
                    source: groupDescriptor.options.map((option) => {
                        let total = (processing.data?.totals[option.value] || 0) as number;
                        if (measureType === 'area') {
                            total = parseFloat(
                                formatArea(total, {
                                    inputUnits: AreaUnit.METERS2,
                                    outputUnits: AreaUnit.KM2
                                })
                            );
                        }
                        colors.push(option?.color || randomColor());
                        return [option.name, total as number];
                    }),
                    dimensions: [groupDescriptor.name, `${processing.dataset.config.name} (${capitalizeString(measureType)})`]
                };

                chartData.colors = colors;
                chartData.secondaryColors = [processing.color];

                if (measureType === 'area') {
                    chartData.valueFormatter = (value) => {
                        return formatArea(value, {
                            inputUnits: AreaUnit.KM2,
                            outputUnits: AreaUnit.KM2,
                            appendUnits: true,
                            precision: 3
                        });
                    };
                    chartData.measure = `Area (km${String.fromCharCode(178)})`;
                } else {
                    chartData.measure = 'Count';
                }
            }
        } else if (processing.data?.mode === DatasetAreaDistributionMode.NumericGroupByEnum) {
            const groupDescriptor = processing.groupByVariableDescriptor;
            if (groupDescriptor?.type == ENUM_FEATURE_PROPERTY_TYPE) {
                const measureType = processing.data?.aggregationMethod;

                const randomColor = randomColorFactory();
                const colors: string[] = [];

                const measure = `${processing.variableDescriptor!.name} (${capitalizeString(measureType)})`;
                chartData.dataset = {
                    id: processing.id,
                    source: groupDescriptor.options.map((option) => {
                        const total = processing.data?.totals[option.value] || 0;
                        colors.push(option?.color || randomColor());
                        return [option.name, total as number];
                    }),
                    dimensions: [groupDescriptor.name, measure]
                };

                chartData.colors = colors;
                chartData.secondaryColors = [processing.color];
                chartData.measure = measure;
            }
        } else if (processing.data?.mode === DatasetAreaDistributionMode.EnumGroupByEnum) {
            const groupDescriptor = processing.groupByVariableDescriptor;
            const variableDescriptor = processing.variableDescriptor;
            if (groupDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE && variableDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE) {
                const randomColor = randomColorFactory();
                const colors: string[] = [];

                chartData.dataset = {
                    id: processing.id,
                    source: groupDescriptor.options.map((option) => {
                        const values = processing.data?.totals[option.value] || {};
                        colors.push(option?.color || randomColor());
                        const totals = variableDescriptor.options.map((option) => values[option.value] || 0);
                        return [option.name, ...totals];
                    }),
                    dimensions: [groupDescriptor.name, ...variableDescriptor.options.map((option) => option.name as string)]
                };
                const measureType = processing.data?.measureType || 'count';

                chartData.colors = colors;
                chartData.secondaryColors = variableDescriptor.options.map((option) => option.color || randomColor());

                if (measureType === 'area') {
                    chartData.valueFormatter = (value) => {
                        return formatArea(value, {
                            inputUnits: AreaUnit.METERS2,
                            outputUnits: AreaUnit.KM2,
                            appendUnits: true,
                            precision: 3
                        });
                    };
                    chartData.measure = 'Area';
                } else {
                    chartData.measure = 'Count';
                }
            }
        }
    }

    return chartData;
};

export const DatasetAreaValuesProcessingChart = (props: DatasetAreaDistributionProcessingProps) => {
    const { token } = theme.useToken();

    const chartData = useSelector(() => {
        return props.processings.length ? getChartDataForProcessing(props.processings[0]) : undefined;
    });

    const [mode, setMode] = useState<'pie' | 'bar'>('bar');
    const [barStack, setBarStack] = useState(false);

    const [chartSize, setChartSize] = useState({ width: 100, height: 100 });

    if (!chartData || chartData.loadingState === LoadingState.Init || chartData.loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={chartData?.loadingState || LoadingState.Error}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    } else if (chartData.loadingState == LoadingState.Success && !chartData.dataset) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No data found' />;
    }
    const xAxes: XAXisOption[] = [];
    const yAxes: YAXisOption[] = [];

    const chartSeries: BarSeriesOption[] | PieSeriesOption[] = [];

    const titles: any[] = [];

    if (chartData.dataset) {
        const columns = chartData.dataset.dimensions as string[];
        const numSeries = columns.length - 1;
        if (mode === 'pie') {
            const topMargin = 50;
            const minRadius = 300;
            const gridXSize = Math.min(Math.floor(chartSize.width / minRadius), numSeries);

            const gridYSize = Math.ceil(numSeries / gridXSize);
            const itemSize = [Math.floor(chartSize.width / gridXSize), Math.floor((chartSize.height - topMargin) / gridYSize)];
            const radius = Math.min(itemSize[0], itemSize[1]) * 0.25;

            columns.slice(1).forEach((column, idx) => {
                const gridXIndex = idx % gridXSize;
                const gridYIndex = Math.floor(idx / gridXSize);
                titles.push({
                    text: column,
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
                });
                (chartSeries as PieSeriesOption[]).push({
                    id: column,
                    name: `${column}`,
                    type: 'pie',
                    radius: radius,
                    showEmptyCircle: false,
                    color: chartData.colors,
                    tooltip: {
                        formatter: (item) => {
                            return `${item.seriesName}<br/>${item.name}: ${chartData.valueFormatter!(item.value[idx + 1] || 0)} (${
                                item.percent
                            })%`;
                        }
                    },
                    center: [itemSize[0] / 2 + itemSize[0] * gridXIndex, topMargin + itemSize[1] / 2 + itemSize[1] * gridYIndex],
                    minShowLabelAngle: 0.1,
                    label: {
                        formatter: (item) => {
                            const label = [
                                `{b|${item.name}:}`,
                                `{per|${chartData.valueFormatter!(item.value[idx + 1] || 0)} (${item.percent}%)}`
                            ];
                            if (numSeries > 1) {
                                label.splice(0, 1);
                            }
                            return label.join('\n');
                        },
                        width: itemSize[0] * 0.2,
                        overflow: 'truncate',
                        fontSize: 15,
                        color: token.colorPrimary,
                        rich: {
                            per: {
                                padding: [0, 0, 8, 0],
                                color: token.colorPrimary,
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
                        itemName: columns[0],
                        value: column
                    }
                });
            });
        } else {
            xAxes.push({
                type: 'category',
                name: columns[0],
                nameLocation: 'middle',
                nameGap: 60,
                axisLabel: {
                    interval: 0,
                    overflow: 'truncate',
                    width: 100,
                    rotate: 30
                }
            });

            yAxes.push({
                type: 'value',
                name: chartData.measure,
                nameGap: 10,
                axisLabel: {
                    formatter: (value) => {
                        return formatNumber(value, {
                            precision: 3,
                            maxLength: 6
                        });
                    }
                }
            });

            columns.slice(1).forEach((column, idx) => {
                (chartSeries as BarSeriesOption[]).push({
                    id: column,
                    name: column,
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    emphasis: { focus: 'series', blurScope: 'global' },
                    stack: barStack ? 'total' : undefined,
                    color: chartData.secondaryColors ? chartData.secondaryColors[idx] : undefined,
                    universalTransition: {
                        enabled: true
                    }
                });
            });
        }
    }

    const chart = (
        <ChartWidget<AreaPieChartOption>
            options={{
                backgroundColor: 'transparent',
                title: titles,
                legend: {
                    textStyle: {
                        width: chartSize.width / 3,
                        overflow: 'truncate'
                    }
                },
                grid: [
                    {
                        containLabel: true,
                        top: 70,
                        bottom: 30
                    }
                ],
                tooltip: {
                    trigger: mode === 'bar' ? 'axis' : 'item',
                    axisPointer: {
                        type: 'shadow'
                    },
                    valueFormatter: (value) => {
                        return chartData.valueFormatter!(value as number);
                    },
                    confine: true
                },
                dataset: chartData.dataset,
                series: chartSeries,
                xAxis: xAxes,
                yAxis: yAxes
            }}
            onSizeChange={(size) => setChartSize(size)}
            isLoading={chartData.loadingState === LoadingState.Loading}
        ></ChartWidget>
    );

    let actions: React.ReactPortal | undefined = undefined;
    if (props.actionContainer.current) {
        actions = createPortal(
            <Space>
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
                {chartData.processing.data?.mode === DatasetAreaDistributionMode.EnumGroupByEnum && mode === 'bar' && (
                    <Checkbox checked={barStack} onChange={(evt) => setBarStack(evt.target.checked)}>
                        Stack
                    </Checkbox>
                )}
            </Space>,
            props.actionContainer.current
        );
    }

    return (
        <div className='dataset-stats-analysis'>
            {actions}
            <div className='series-chart'>{chart}</div>
        </div>
    );
};
