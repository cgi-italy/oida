import React from 'react';
import { useObserver } from 'mobx-react';

import { EChartOption } from 'echarts';

import length from '@turf/length';
import along from '@turf/along';

import { LoadingState } from '@oida/core';
import { IDatasetTransectSeries } from '@oida/eo';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';


export type DatasetTransectSeriesChartProps = {
    series: IDatasetTransectSeries[];
    colors: string[];
};

type LegendDataItem = {
    id: string,
    name: string,
    line: GeoJSON.Feature<GeoJSON.LineString>
    description?: string
};

export const DatasetTransectSeriesChart = (props: DatasetTransectSeriesChartProps) => {

    let nextYAxisIndex = 0;

    let yAxes = {};

    const legendData: LegendDataItem[] = [];

    let loadingState = LoadingState.Init;

    const {chartSeries, colors} = useObserver(() => {

        let chartSeries: EChartOption.SeriesLine[] = [];
        let colors: string[] = [];

        props.series.forEach((series, idx) => {

            let variable = series.variable;
            if (!variable) {
                return;
            }

            let variableConfig = series.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return;
            }

            if (!series.aoi) {
                return;
            }

            const line = {
                type: 'Feature',
                geometry: series.aoi.geometry as GeoJSON.LineString,
                properties: {}
            } as GeoJSON.Feature<GeoJSON.LineString>;
            const distance = length(line);

            let yAxisUnits = variableConfig.units || variableConfig.id;
            if (!yAxes[yAxisUnits]) {
                yAxes[yAxisUnits] = {
                    idx: nextYAxisIndex++,
                    label: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
                };
            }

            if (series.loadingState === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (series.loadingState === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            }

            colors.push(props.colors[idx]);
            legendData[idx] = {
                id: `${idx}`,
                line: line,
                name: `${series.dataset.config.name}: ${variableConfig.name}`
            };

            chartSeries.push({
                type: 'line',
                name: `${idx}`,
                yAxisIndex: yAxes[yAxisUnits].idx,
                smooth: true,
                data: series.data.map((item, idx) => [idx / series.data.length * distance, item])
            });


        });

        return {chartSeries, colors};
    });

    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    }

    let yAx = Object.keys(yAxes).map((axisUnits, idx) => {
        return {
            type: 'value',
            name: yAxes[axisUnits].label,
            nameLocation: 'end',
            position: (idx % 2) ? 'right' : 'left',
            nameGap: 10,
            offset: Math.floor(idx / 2) * 60
        };
    });

    return (
        <div className='series-chart'>
            <ChartWidget
                options={{
                    color: colors,
                    legend: {
                        data: legendData.map(item => item.id),
                        right: '10px',
                        formatter: (name) => {
                            return legendData[name].name;
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        transitionDuration: 0,
                        formatter: (series: EChartOption.Tooltip.Format[]) => {

                            if (!series.length) {
                                return '';
                            }

                            let lines: Array<{
                                geometry: GeoJSON.LineString,
                                content: string[],
                                distance: number,
                                coords: number[]
                            }> = [];

                            try {

                                let seriesContent = series.forEach((data) => {

                                    let seriesInfo = legendData[parseInt(data.seriesName!)];

                                    let line = lines.find(l => l.geometry === seriesInfo.line.geometry);
                                    if (!line) {
                                        let point = along(seriesInfo.line, data.axisValue as number);

                                        line = {
                                            geometry: seriesInfo.line.geometry,
                                            distance: data.axisValue as number,
                                            coords: point.geometry.coordinates,
                                            content: []
                                        };
                                        lines.push(line);
                                    }

                                    line.content.push( `
                                        <div class="series-item is-point">
                                            <span>${data.marker}</span>
                                            <span class="label">${seriesInfo.name}:</span>
                                            <span class="value">${data.data[1].toFixed(2)}</span>
                                        </div>
                                    `);
                                });

                                let items = lines.map((line, idx) => {
                                    return `
                                        <div class="axis-item">
                                            <div class="axis-header">
                                                <span class="label">Position:</span>
                                                <span class="value">${line.coords[0].toFixed(3)} ${line.coords[1].toFixed(3)}</span>
                                            </div>
                                            <div class="axis-values">
                                                ${line.content.join('')}
                                            </div>
                                        </div>
                                    `;
                                }).join('');

                                return `
                                    <div class="dataset-dimension-series-tooltip">
                                        ${items}
                                    </div>
                                `;
                            } catch (e) {
                                return '';
                            }
                        },
                        textStyle: {
                            fontSize: 13
                        },
                        axisPointer: {
                            type: 'line',
                            snap: true
                        }
                    },
                    xAxis: [{
                        type: 'value',
                        name: 'Relative distance (km)',
                        nameLocation: 'middle',
                        nameGap: 20
                    }],
                    yAxis: yAx,
                    grid: {
                        left: 40,
                        right: 40,
                        bottom: 40,
                        top: 60,
                        containLabel: true
                    },
                    series: chartSeries,
                    backgroundColor: 'transparent'
                } as EChartOption}
                isLoading={loadingState === LoadingState.Loading}
            />
        </div>
    );
};

