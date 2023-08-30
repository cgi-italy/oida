import React from 'react';
import { Empty } from 'antd';
import * as echarts from 'echarts/core';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';

import { LoadingState, randomColorFactory } from '@oidajs/core';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetAreaDistribution } from '@oidajs/eo-mobx';

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

            const colorMap: Record<string, string | undefined> = {};
            if (descriptor) {
                descriptor.options.map((option) => {
                    return (colorMap[option.value] = option.color ?? undefined);
                });
            }

            const randomColor = randomColorFactory();
            const colors: string[] = [];
            const series = processing.data?.map((data) => {
                if (colorMap[data.name]) colors.push(colorMap[data.name] ?? randomColor());
                return {
                    value: data.count,
                    name: data.name
                };
            });

            if (series?.length) {
                pieDataSeries.push({
                    name: processing.name,
                    type: 'pie',
                    radius: '50%',
                    data: series,
                    showEmptyCircle: false,
                    ...(colors.length > 0 && { color: colors })
                });
            }
        });
        return { pieDataSeries, loadingState };
    });

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
                    confine: true,
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                labelLine: {
                    length: 15,
                    length2: 0,
                    maxSurfaceAngle: 80
                },
                label: {
                    formatter: '{per|{d}%}\n{b|{b}:} {c}',
                    fontSize: 15,
                    color: '#b0a1e4',
                    rich: {
                        per: {
                            padding: [8, 0, 0, 0],
                            color: '#b0a1e4',
                            lineHeight: 22,
                            align: 'center',
                            fontSize: 15,
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
