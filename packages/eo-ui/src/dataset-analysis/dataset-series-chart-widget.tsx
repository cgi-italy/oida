import React from 'react';
import { useObserver } from 'mobx-react';

import { Form } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetAnalysis, IDatasetTimeSeries, IDatasetDomainSeries, TIME_SERIES_TYPE } from '@oida/eo';
import { SelectEnumRenderer } from '@oida/ui-react-antd';

import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';

import { ChartWidget } from './chart-widget';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import { EChartOption } from 'echarts';

export type DatasetSeriesFiltersProps = {
    series: IDatasetDomainSeries | IDatasetTimeSeries
    analysis: IDatasetAnalysis
};

export const DatasetSeriesFilters = (props: DatasetSeriesFiltersProps) => {

    let variableValue = useObserver(() => props.series.variable);

    let variableFieldConfig = {
        choices: props.series.config.variables.map((variable) => {
            return {
                value: variable.id,
                name: variable.name
            };
        })
    };

    return (
        <React.Fragment>
            <Form.Item>
                <SelectEnumRenderer
                    config={variableFieldConfig}
                    value={variableValue}
                    placeholder='Select variable'
                    onChange={(value) => {
                        props.series.setVariable(value as string);
                    }}
                />
            </Form.Item>
            <Form.Item>
                <AnalysisAoiFilter
                    analysis={props.analysis}
                    supportedGeometries={props.series.config.supportedGeometries}
                />
            </Form.Item>
        </React.Fragment>
    );
};

export type DatasetSeriesChartWidgetProps<T extends IDatasetTimeSeries | IDatasetDomainSeries> = {
    series: T[];
    color: string;
};

export function DatasetSeriesChartWidget<T extends IDatasetTimeSeries | IDatasetDomainSeries>(props: DatasetSeriesChartWidgetProps<T>)  {

    let nextAxisIndex = 0;
    let axes = {};

    let colors: string[] = [];
    let legendData: string[] = [];

    let loadingState = LoadingState.Init;

    let series = props.series;
    let isTime = false;
    if (series.length) {
        isTime = props.series[0].datasetVizType === TIME_SERIES_TYPE;
    }

    let chartSeries = useObserver(() => series.map((series) => {

        let variable = series.variable;
        if (!variable) {
            return;
        }

        let variableConfig = series.config.variables.find((v) => v.id === variable);
        if (!variableConfig) {
            return;
        }

        let axisName = variableConfig.units || 'default';
        if (!axes[axisName]) {
            axes[axisName] = {
                idx: nextAxisIndex++,
                label: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
            };
        }

        colors.push(props.color);
        legendData.push(variableConfig.name);

        if (series.loadingState === LoadingState.Loading) {
            loadingState = LoadingState.Loading;
        } else if (series.loadingState === LoadingState.Success && loadingState !== LoadingState.Loading) {
            loadingState = LoadingState.Success;
        } else if (series.loadingState === LoadingState.Error && loadingState !== LoadingState.Loading) {
            loadingState = LoadingState.Error;
        }

        return {
            type: 'line',
            name: variableConfig.name,
            yAxisIndex: axes[axisName].idx,
            smooth: true,
            // @ts-ignore
            data: series.data.map((item) => [item.x, item.y])
        };
    })).filter(series => series !== undefined);

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Specify a point and a range to retrieve the data'
            />
        );
    }

    let yAxes = Object.keys(axes).map((axisName) => {
        return {
            type: 'value',
            name: axes[axisName].label,
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30
        };
    });

    let xAxisDomain = props.series[0].config.domain;

    let xAxisLabel = `${xAxisDomain.name}${xAxisDomain.units ? `(${xAxisDomain.units})` : ''}`;

    return (
        <ChartWidget
            options={{
                color: colors,
                legend: {
                    data: legendData,
                    right: '10px'
                },
                tooltip: {
                    trigger: 'axis',
                    transitionDuration: 0,

                    axisPointer: {
                        type: 'line',
                        snap: true
                    }
                },
                xAxis: [{
                    type: isTime ? 'time' : 'value',
                    name: xAxisLabel,
                    nameLocation: 'middle'
                }],
                yAxis: yAxes,
                grid: {
                    left: 20,
                    right: 20,
                    bottom: 10,
                    top: 20,
                    containLabel: true
                },
                series: chartSeries,
                useUTC: true,
                backgroundColor: 'transparent'
            } as EChartOption}
            isLoading={loadingState === LoadingState.Loading}
        />
    );
}
