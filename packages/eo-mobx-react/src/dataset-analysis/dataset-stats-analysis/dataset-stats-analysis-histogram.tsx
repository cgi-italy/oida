import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Badge, Button, Descriptions, Collapse, Space } from 'antd';
import { EChartOption } from 'echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/axisPointer';
import 'echarts/lib/component/brush';

import { LoadingState } from '@oida/core';
import {
    DatasetStatsAnalysis, RasterMapViz, RasterBandModeType,
    isDomainProvider, NumericDomainMapper
} from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';


export type DatasetStatsAnalysisProps = {
    analyses: DatasetStatsAnalysis[];
};

export const DatasetStatsTable = (props: DatasetStatsAnalysisProps) => {
    const infoPanels: (JSX.Element | undefined)[] = useSelector(() => {
        return props.analyses.map((analysis) => {

            const variable = analysis.variable;
            if (!variable) {
                return undefined;
            }

            const variableConfig = analysis.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return undefined;
            }

            if (!analysis.data) {
                return undefined;
            }

            const variableDomain = variableConfig.domain;
            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

            const dimensionsInfo: JSX.Element[] = [];
            analysis.dimensions.values.forEach((value, key) => {
                const dimensionConfig = analysis.config.dimensions.find((d) => d.id === key);
                if (dimensionConfig) {
                    let stringValue = value.toString();
                    if (value instanceof Date) {
                        stringValue = moment(value).format('YYYY-MM-DD HH:mm');
                    }
                    dimensionsInfo.push(
                        <Descriptions.Item key={dimensionConfig.id} label={dimensionConfig.name}>{stringValue}</Descriptions.Item>
                    );
                }
            });

            return (
                <Collapse.Panel
                    id={analysis.id}
                    key={analysis.id}
                    header={(
                        <div
                            onMouseEnter={() => analysis.hovered.setValue(true)}
                            onMouseLeave={() => analysis.hovered.setValue(false)}
                        >
                            <Badge color={analysis.color} text={analysis.dataset.config.name} />
                        </div>
                    )}
                >
                    <Descriptions
                        key={analysis.id}
                        size='small'
                        column={1}
                    >
                        <Descriptions.Item label='Variable'>{variableConfig.name}</Descriptions.Item>
                        {dimensionsInfo}
                        {variableConfig.units &&
                            <Descriptions.Item label='Units'>
                                {variableConfig.units}
                            </Descriptions.Item>
                        }
                        {analysis.data.min !== undefined &&
                            <Descriptions.Item label='Min'>
                                {domainMapper.formatValue(analysis.data.min, {
                                    precision: 3
                                })}
                            </Descriptions.Item>
                        }
                        {analysis.data.max !== undefined &&
                            <Descriptions.Item label='Max'>
                                {domainMapper.formatValue(analysis.data.max, {
                                    precision: 3
                                })}
                            </Descriptions.Item>
                        }
                        {analysis.data.mean !== undefined &&
                            <Descriptions.Item label='Mean'>
                                {domainMapper.formatValue(analysis.data.mean, {
                                    precision: 3
                                })}
                            </Descriptions.Item>
                        }
                        {analysis.data.variance !== undefined &&
                            <React.Fragment>
                                <Descriptions.Item label='Variance'>
                                    {(analysis.data.variance * Math.pow(domainMapper.domainScalingFactor, 2)).toFixed(3)}
                                </Descriptions.Item>
                                <Descriptions.Item label='Standard deviation'>
                                    {(Math.sqrt(analysis.data.variance) * domainMapper.domainScalingFactor).toFixed(3)}
                                </Descriptions.Item>
                            </React.Fragment>
                        }
                        {analysis.data.median !== undefined &&
                            <Descriptions.Item label='Median'>
                                {domainMapper.formatValue(analysis.data.median, {
                                    precision: 3
                                })}
                            </Descriptions.Item>
                        }
                    </Descriptions>
                </Collapse.Panel>
            );
        });
    });

    return (
        <Collapse
            defaultActiveKey={props.analyses.map((analysis) => analysis.id)}
            expandIconPosition='right'
            className='dataset-stats-table'
        >
            {infoPanels}
        </Collapse>
    );
};

export const DatasetStatsAnalysisHistogram = (props: DatasetStatsAnalysisProps) => {

    const [chartSize, setChartSize] = useState<{width: number, height: number}>();

    const [selectedRange, setSelectedRange] = useState<{
        analysis: DatasetStatsAnalysis,
        seriesIndex: number,
        min: number,
        max: number,
        brushArea: any
    }>();

    const [chartGrids, setChartGrids] = useState<EChartOption.Grid[]>([]);

    const {chartSeries, loadingState, xAxes, yAxes, domainMappers} = useSelector(() => {

        const chartSeries: EChartOption.SeriesBar[] = [];

        let loadingState = LoadingState.Init;

        const xAxes: EChartOption.XAxis[] = [];
        const yAxes: EChartOption.YAxis[]  = [];
        const grids: EChartOption.Grid[] = [];
        const domainMappers: NumericDomainMapper[] = [];

        const margin = 40;

        const gridHeight = chartSize
            ? ((chartSize.height - margin) / props.analyses.length)
            : Math.floor(100 / props.analyses.length);

        props.analyses.forEach((analysis, idx) => {

            let variable = analysis.variable;
            if (!variable) {
                return;
            }

            let variableConfig = analysis.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return;
            }

            if (analysis.loadingState.value === LoadingState.Init) {
                return;
            }

            const variableDomain = variableConfig.domain;

            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

            if (!analysis.data || !analysis.data.histogram) {
                return;
            }

            domainMappers.push(domainMapper);

            xAxes.push({
                type: 'category',
                gridIndex: idx,
                name: `${variableConfig.name} ${variableConfig.units ? `(${variableConfig.units})` : ''}`,
                nameLocation: 'middle',
                nameGap: 25,
                axisLine: {
                    onZero: true
                }
            });

            yAxes.push({
                type: 'value',
                gridIndex: idx,
                name: 'Count',
                nameGap: 10
            });

            grids.push({
                id: idx.toString(),
                height: chartSize ? gridHeight - margin : `${gridHeight}%`,
                top: chartSize ? margin + gridHeight * idx : `${gridHeight * idx}%`,
                left: 40,
                right: 40,
                containLabel: true
            });

            if (analysis.loadingState.value === LoadingState.Loading) {
                loadingState = LoadingState.Loading;
            } else if (analysis.loadingState.value === LoadingState.Success && loadingState !== LoadingState.Loading) {
                loadingState = LoadingState.Success;
            } else if (analysis.loadingState.value === LoadingState.Error && loadingState !== LoadingState.Success) {
                loadingState = LoadingState.Error;
            }

            chartSeries.push({
                type: 'bar',
                barWidth: '98%',
                dimensions: [variableConfig.name, 'Count', 'min', 'max'],
                name: `${idx}`,
                xAxisIndex: idx,
                yAxisIndex: idx,
                data: analysis.data.histogram.map((value) => {
                    return [
                        domainMapper.normalizeValue(value[0]),
                        value[1],
                        domainMapper.normalizeValue(value[2]),
                        domainMapper.normalizeValue(value[3])
                    ];
                })
            });

        });

        setChartGrids(grids);
        setSelectedRange(undefined);

        return {chartSeries, loadingState, xAxes, yAxes, domainMappers};
    });

    const colors = useSelector(() => {
        return props.analyses.map((analysis) => analysis.color);
    });

    useEffect(() => {
        const margin = 40;
        const gridHeight = chartSize
            ? ((chartSize.height - margin) / props.analyses.length)
            : Math.floor(100 / props.analyses.length);

        setChartGrids((grids) => {
            return grids.map((grid) => {
                return {
                    ...grid,
                    height: chartSize ? gridHeight - margin : `${gridHeight}%`
                };
            });
        });
    }, [chartSize]);

    const parentViz = selectedRange?.analysis.parent;
    const selectedRangeDomainMapper = selectedRange ? domainMappers[selectedRange.seriesIndex] : undefined;
    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return (
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Fill the series params to retrieve the data'
            />
        );
    }

    return (
        <div className='dataset-stats-analysis'>
            <div className='series-chart'>
                <DatasetStatsTable analyses={props.analyses}/>
                <ChartWidget
                    onSizeChange={(size) => {
                        setChartSize(size);
                    }}
                    brushMode='lineX'
                    brushArea={selectedRange?.brushArea}
                    onBrushEnd={(evt) => {
                        const brushArea = evt.areas[0];
                        if (brushArea) {
                            const analysisIndexMatch = brushArea.panelId.match(/grid--([0-9]+)/);
                            if (analysisIndexMatch) {
                                const seriesIndex = parseInt(analysisIndexMatch[1]);
                                const analysis = props.analyses[seriesIndex];
                                const histogramData = analysis.data!.histogram!;
                                const coordRange = [
                                    Math.max(brushArea.coordRange[0], 0),
                                    Math.min(brushArea.coordRange[1], histogramData.length - 1)];
                                const min = histogramData[coordRange[0]][2];
                                const max = histogramData[coordRange[1]][3];
                                setSelectedRange({min, max, seriesIndex, analysis, brushArea});
                            }
                        } else {
                            setSelectedRange(undefined);
                        }
                    }}
                    options={{
                        color: colors,
                        tooltip: {
                            trigger: 'item',
                            transitionDuration: 0,
                            textStyle: {
                                fontSize: 13
                            },
                            formatter: (analysis: EChartOption.Tooltip.Format) => {
                                return analysis.value ? `
                                    <div>
                                        <div>${analysis.dimensionNames![0]} range: ${analysis.value[2]} to ${analysis.value[3]}</div>
                                        <div>Count: ${analysis.value ? analysis.value[1] : ''}</div>
                                    </div>
                                ` : '';
                            }
                        },
                        xAxis: xAxes,
                        yAxis: yAxes,
                        brush: {
                            toolbox: ['lineX', 'clear'],
                            xAxisIndex: xAxes.map((axis, idx) => idx),
                            outOfBrush: {
                                colorAlpha: 0.2
                            }
                        },
                        toolbox: {
                            feature: {
                                brush: {
                                    title: {
                                        lineX: 'Select a range',
                                        clear: 'Clear selection'
                                    }
                                }
                            }
                        },
                        grid: chartGrids,
                        series: chartSeries,
                        backgroundColor: 'transparent'
                    } as EChartOption}
                    isLoading={loadingState === LoadingState.Loading}
                />
            </div>
            {selectedRange && parentViz instanceof RasterMapViz && selectedRangeDomainMapper &&
                <div className='dataset-stats-analysis-ops'>
                    <Space>
                        <span>Selected data range: </span>
                        <span>
                            {selectedRangeDomainMapper.formatValue(selectedRange.min, {
                                precision: 2
                            })}, {selectedRangeDomainMapper.formatValue(selectedRange.max, {
                                precision: 2
                            })}
                        </span>
                    </Space>
                    <Button onClick={() => {

                        const bandMode = parentViz.bandMode.value;

                        if (bandMode?.type === RasterBandModeType.Single) {
                            bandMode.setBand(selectedRange.analysis.variable!);

                            const colorMap = bandMode.colorMap;

                            if (colorMap.domain) {
                                colorMap.domain.setRange({
                                    min: selectedRange.min,
                                    max: selectedRange.max
                                });
                            } else {
                                colorMap.setColorMapDomain({
                                    mapRange: {
                                        min: selectedRange.min,
                                        max: selectedRange.max
                                    }
                                });
                            }
                        } else {

                            const singleBandConfig = parentViz.config.bandMode.supportedModes.find((mode) => {
                                return mode.type === RasterBandModeType.Single;
                            });

                            if (singleBandConfig) {
                                const bandConfig = parentViz.config.bandMode.bands?.find(
                                    (band) => band.id === selectedRange.analysis.variable!
                                );

                                if (bandConfig && bandConfig.colorScales) {

                                    parentViz.bandMode.setValue({
                                        type: RasterBandModeType.Single,
                                        band: selectedRange.analysis.variable!,
                                        colorMap: {
                                            colorScale: bandConfig.default?.colorScale || bandConfig.colorScales[0].id,
                                            domain: {
                                                mapRange: {
                                                    min: selectedRange.min,
                                                    max: selectedRange.max
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }

                        selectedRange.analysis.dimensions.values.forEach((value, key) => {
                            if (key === 'time') {
                                selectedRange.analysis.dataset.setSelectedDate(value as Date);
                            } else {
                                parentViz.dimensions.setValue(key, value);
                            }
                        });
                    }}>
                        Apply settings to map visualization
                    </Button>
                </div>
            }
        </div>
    );
};

