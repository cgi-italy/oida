import React from 'react';
import { Empty, theme } from 'antd';
import * as echarts from 'echarts/core';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';

import { AreaUnit, formatArea, LoadingState, randomColorFactory } from '@oidajs/core';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaDistribution, EnumFeaturePropertyOption } from '@oidajs/eo-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';

export type DatasetAreaDistributionProcessingPieProps = {
    processing: DatasetAreaDistribution[];
};

type AreaPieChartOption = echarts.ComposeOption<PieSeriesOption | TooltipComponentOption | LegendComponentOption>;

echarts.use([PieChart, TooltipComponent, LegendComponent]);

export const DatasetAreaValuesProcessingPieChart = (props: DatasetAreaDistributionProcessingPieProps) => {
    const { pieDataSeries, loadingState } = useSelector(() => {
        const pieDataSeries: PieSeriesOption[] = [];
        let loadingState = LoadingState.Init;

        props.processing.forEach((processing) => {
            const descriptor = processing.config.variables.find((value) => value.id === processing.variable);

            if (processing.loadingState.value === LoadingState.Init) {
                return;
            }

            if (processing.loadingState.value === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (processing.loadingState.value === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            } else if (processing.loadingState.value === LoadingState.Error && loadingState !== LoadingState.Success) {
                loadingState = LoadingState.Error;
            }

            const optionsMap = descriptor?.options.reduce((optionsMap: Record<string, EnumFeaturePropertyOption>, option) => {
                return {
                    ...optionsMap,
                    [option.value]: {
                        color: option.color,
                        description: option.description,
                        name: option.name,
                        value: option.value
                    }
                };
            }, {});

            const randomColor = randomColorFactory();
            const colors: string[] = [];
            const series = Object.entries(processing.data?.totals || []).map(([propertyValue, total]) => {
                const optionConfig = optionsMap ? optionsMap[propertyValue] : undefined;
                colors.push(optionConfig?.color || randomColor());
                return {
                    value: total,
                    name: optionConfig?.name || propertyValue
                };
            });

            if (series?.length) {
                const valueFormatter = (value: number) => {
                    let formattedValue: number | string = value;
                    if (processing.data?.measureType === 'area') {
                        formattedValue = formatArea(value, {
                            inputUnits: AreaUnit.METERS2,
                            outputUnits: AreaUnit.KM2,
                            appendUnits: true,
                            precision: 3
                        });
                    }
                    return formattedValue;
                };

                pieDataSeries.push({
                    name: processing.name,
                    type: 'pie',
                    radius: '50%',
                    data: series,
                    showEmptyCircle: false,
                    color: colors,
                    tooltip: {
                        formatter: (item) => {
                            return `${item.name}: ${valueFormatter(item.value)} (${item.percent})%`;
                        }
                    },
                    labelLine: {
                        length: 15,
                        length2: 0,
                        maxSurfaceAngle: 80
                    },
                    label: {
                        //formatter: '{per|{d}%}\n{b|{b}:} {c}',
                        formatter: (item) => {
                            return [`{b|${item.name}:}`, `{per|${valueFormatter(item.value as number)} (${item.percent}%)}`].join('\n');
                        },
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
                    }
                });
            }
        });
        return { pieDataSeries, loadingState };
    });

    const { token } = theme.useToken();

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return <AnalysisLoadingStateMessage loadingState={loadingState} initMessage='Fill the series params to retrieve the data' />;
    } else if (loadingState == LoadingState.Success && !pieDataSeries.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No data found' />;
    }

    const chart = (
        <ChartWidget<AreaPieChartOption>
            options={{
                backgroundColor: 'transparent',
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                tooltip: {
                    trigger: 'item',
                    confine: true
                },
                series: pieDataSeries
            }}
            isLoading={loadingState === LoadingState.Loading}
        ></ChartWidget>
    );

    return (
        <div className='dataset-stats-analysis'>
            <div className='series-chart'>{chart}</div>
        </div>
    );
};
