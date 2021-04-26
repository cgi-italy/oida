import React, { useCallback, useState } from 'react';

import { EChartOption } from 'echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';

import { LoadingState } from '@oida/core';
import { DatasetTransectSeries, isDomainProvider, NumericDomainMapper } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';


export type DatasetTransectSeriesChartProps = {
    series: DatasetTransectSeries[];
};

type LegendDataItem = {
    id: string,
    name: string,
    seriesIdx: number,
    description?: string
};

export function DatasetTransectSeriesChart(props: DatasetTransectSeriesChartProps) {

    const [trackCoordinate, setTrackCoordinate] = useState(false);

    const {chartSeries, colors, loadingState, legendData, yAxes} = useSelector(() => {

        let chartSeries: EChartOption.SeriesLine[] = [];
        let colors: string[] = [];

        let loadingState = LoadingState.Init;
        const legendData: LegendDataItem[] = [];

        let yAxes = {};

        let nextYAxisIndex = 0;

        props.series.forEach((series, idx) => {

            let variable = series.seriesVariable;
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

            const variableDomain = variableConfig.domain;
            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

            let yAxisUnits = variableConfig.units || variableConfig.id;
            if (!yAxes[yAxisUnits]) {
                yAxes[yAxisUnits] = {
                    idx: nextYAxisIndex++,
                    label: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`
                };
            }

            if (series.loadingState.value === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (series.loadingState.value === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            } else if (series.loadingState.value === LoadingState.Error && loadingState !== LoadingState.Success) {
                loadingState = LoadingState.Error;
            }

            colors.push(series.color);
            legendData[idx] = {
                id: `${idx}`,
                seriesIdx: idx,
                name: `${series.dataset.config.name}: ${variableConfig.name}`
            };

            const chartData: Array<number[]> = [];
            series.data.forEach((item) => {
                const scaledValue = domainMapper.normalizeValue(item.value);
                if (scaledValue !== undefined) {
                    chartData.push([item.distance, scaledValue]);
                }
            });

            chartSeries.push({
                type: 'line',
                name: `${idx}`,
                yAxisIndex: yAxes[yAxisUnits].idx,
                smooth: true,
                data: chartData
            });

        });

        return {chartSeries, colors, legendData, loadingState, yAxes};
    });

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

    const tooltipFormatter = useCallback((series: EChartOption.Tooltip.Format[]) => {

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

            series.forEach((data) => {

                let seriesInfo = legendData[parseInt(data.seriesName!)];
                let transectSeries = props.series[seriesInfo.seriesIdx];

                let line = lines.find(l => l.geometry === transectSeries.aoi?.geometry.value);
                if (!line) {

                    let coordinates = transectSeries.data[data.dataIndex!].coordinates;

                    line = {
                        geometry: transectSeries.aoi!.geometry.value as GeoJSON.LineString,
                        distance: data.axisValue as number,
                        coords: coordinates,
                        content: []
                    };
                    lines.push(line);
                    if (trackCoordinate) {
                        transectSeries.setHighlightedPosition(data.dataIndex);
                    }
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
                            <span class="value">Lat: ${line.coords[1].toFixed(3)} Lon: ${line.coords[0].toFixed(3)}</span>
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
    }, [trackCoordinate]);

    const disableCoordinateTrack = () => {
        setTrackCoordinate(false);
        props.series.forEach(series => {
            series.setHighlightedPosition(undefined);
        });
    };

    const highlightedItems = useSelector(() => {
        const highlightedItems: any[] = [];
        legendData.forEach((item) => {
            let highlightedPosition = props.series[item.seriesIdx].highlightedPosition;
            if (highlightedPosition !== undefined) {
                highlightedItems.push({
                    seriesIndex: item.seriesIdx,
                    dataIndex: highlightedPosition
                });
            }
        });

        return highlightedItems;
    }, [legendData]);

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
                onMouseEnter={() => setTrackCoordinate(true)}
                onMouseLeave={disableCoordinateTrack}
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
                        formatter: tooltipFormatter,
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
                showTip={!trackCoordinate ? highlightedItems[0] : undefined}
            />
        </div>
    );
}
