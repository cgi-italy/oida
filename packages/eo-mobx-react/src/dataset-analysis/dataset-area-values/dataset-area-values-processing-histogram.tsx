import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Badge, Button, Descriptions, Collapse, Space } from 'antd';
import * as echarts from 'echarts/core';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import {
    TooltipComponent,
    TooltipComponentOption,
    LegendComponent,
    LegendComponentOption,
    AxisPointerComponent,
    AxisPointerComponentOption,
    BrushComponent,
    BrushComponentOption,
    GridComponent,
    GridComponentOption,
    ToolboxComponent,
    ToolboxComponentOption
} from 'echarts/components';
import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';

import { formatNumber, LoadingState, NumberFormatOptions } from '@oidajs/core';
import {
    DatasetAreaValues,
    RasterMapViz,
    RasterBandModeType,
    isDomainProvider,
    NumericDomainMapper,
    ColorScaleType
} from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { ChartWidget } from '../chart-widget';

type AreaHistoyramChartOption = echarts.ComposeOption<
    | BarSeriesOption
    | TooltipComponentOption
    | LegendComponentOption
    | AxisPointerComponentOption
    | BrushComponentOption
    | GridComponentOption
    | ToolboxComponentOption
>;

echarts.use([BarChart, TooltipComponent, LegendComponent, AxisPointerComponent, BrushComponent, GridComponent, ToolboxComponent]);

export type DatasetAreaValuesProcessingTableProps = {
    processings: DatasetAreaValues[];
    numberFormatOptions?: NumberFormatOptions;
};

export const DatasetAreaValuesProcessingTable = (props: DatasetAreaValuesProcessingTableProps) => {
    const infoPanels: (JSX.Element | undefined)[] = useSelector(() => {
        return props.processings.map((processing) => {
            const variable = processing.variable;
            if (!variable) {
                return undefined;
            }

            const variableConfig = processing.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                return undefined;
            }

            if (!processing.data) {
                return undefined;
            }

            const variableDomain = variableConfig.domain;
            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

            const dimensionsInfo: JSX.Element[] = [];
            processing.dimensions.values.forEach((value, key) => {
                const dimensionConfig = processing.config.dimensions.find((d) => d.id === key);
                if (dimensionConfig) {
                    let stringValue = value.toString();
                    if (value instanceof Date) {
                        stringValue = moment.utc(value).format('YYYY-MM-DD HH:mm');
                    }
                    dimensionsInfo.push(
                        <Descriptions.Item key={dimensionConfig.id} label={dimensionConfig.name}>
                            {stringValue}
                        </Descriptions.Item>
                    );
                }
            });

            const numberFormatOptions = props.numberFormatOptions || {
                maxLength: 10,
                precision: 3
            };

            return (
                <Collapse.Panel
                    id={processing.id}
                    key={processing.id}
                    header={
                        <div
                            className='dataset-stats-header'
                            onMouseEnter={() => processing.hovered.setValue(true)}
                            onMouseLeave={() => processing.hovered.setValue(false)}
                        >
                            <Badge color={processing.color} text={processing.dataset.config.name} />
                        </div>
                    }
                >
                    <Descriptions key={processing.id} size='small' column={1}>
                        <Descriptions.Item label='Variable'>{variableConfig.name}</Descriptions.Item>
                        {dimensionsInfo}
                        {variableConfig.units && <Descriptions.Item label='Units'>{variableConfig.units}</Descriptions.Item>}
                        {processing.data.stats?.min !== undefined && (
                            <Descriptions.Item label='Min'>
                                {domainMapper.formatValue(processing.data.stats.min, numberFormatOptions)}
                            </Descriptions.Item>
                        )}
                        {processing.data.stats?.max !== undefined && (
                            <Descriptions.Item label='Max'>
                                {domainMapper.formatValue(processing.data.stats.max, numberFormatOptions)}
                            </Descriptions.Item>
                        )}
                        {processing.data.stats?.mean !== undefined && (
                            <Descriptions.Item label='Mean'>
                                {domainMapper.formatValue(processing.data.stats.mean, numberFormatOptions)}
                            </Descriptions.Item>
                        )}
                        {processing.data.stats?.variance !== undefined && (
                            <React.Fragment>
                                <Descriptions.Item label='Variance'>
                                    {formatNumber(
                                        processing.data.stats.variance * Math.pow(domainMapper.domainScalingFactor, 2),
                                        numberFormatOptions
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label='Standard deviation'>
                                    {formatNumber(
                                        Math.sqrt(processing.data.stats.variance) * domainMapper.domainScalingFactor,
                                        numberFormatOptions
                                    )}
                                </Descriptions.Item>
                            </React.Fragment>
                        )}
                        {processing.data.stats?.median !== undefined && (
                            <Descriptions.Item label='Median'>
                                {domainMapper.formatValue(processing.data.stats.median, numberFormatOptions)}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Collapse.Panel>
            );
        });
    });

    return (
        <Collapse
            defaultActiveKey={props.processings.map((processing) => processing.id)}
            expandIconPosition='end'
            className='dataset-stats-table'
        >
            {infoPanels}
        </Collapse>
    );
};

export const DatasetAreaValuesProcessingHistogram = (props: DatasetAreaValuesProcessingTableProps) => {
    const [chartSize, setChartSize] = useState<{ width: number; height: number }>();

    const [selectedRange, setSelectedRange] = useState<{
        processing: DatasetAreaValues;
        seriesIndex: number;
        min: number;
        max: number;
        brushArea: any;
    }>();

    const [chartGrids, setChartGrids] = useState<GridComponentOption[]>([]);

    const { chartSeries, loadingState, xAxes, yAxes, domainMappers } = useSelector(() => {
        const chartSeries: BarSeriesOption[] = [];

        let loadingState = LoadingState.Init;

        const xAxes: XAXisOption[] = [];
        const yAxes: YAXisOption[] = [];
        const grids: GridComponentOption[] = [];
        const domainMappers: NumericDomainMapper[] = [];

        const margin = 40;

        const gridHeight = chartSize ? (chartSize.height - margin) / props.processings.length : Math.floor(100 / props.processings.length);

        props.processings.forEach((processing, idx) => {
            const variable = processing.variable;
            if (!variable) {
                loadingState = LoadingState.Error;
                return;
            }

            const variableConfig = processing.config.variables.find((v) => v.id === variable);
            if (!variableConfig) {
                loadingState = LoadingState.Error;
                return;
            }

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

            if (!processing.data || !processing.data.stats?.histogram) {
                return;
            }

            const variableDomain = variableConfig.domain;

            const domainMapper = new NumericDomainMapper({
                domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
                unitsSymbol: variableConfig.units
            });

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

            chartSeries.push({
                type: 'bar',
                barWidth: '98%',
                dimensions: [variableConfig.name, 'Count', 'min', 'max'],
                name: `${idx}`,
                xAxisIndex: idx,
                yAxisIndex: idx,
                data: processing.data.stats.histogram.map((value) => {
                    return [
                        domainMapper.normalizeValue(value[0]),
                        value[1],
                        domainMapper.normalizeValue(value[2]),
                        domainMapper.normalizeValue(value[3])
                    ] as number[];
                })
            });
        });

        setChartGrids(grids);
        setSelectedRange(undefined);

        return { chartSeries, loadingState, xAxes, yAxes, domainMappers };
    });

    const colors = useSelector(() => {
        return props.processings.map((processing) => processing.color);
    });

    useEffect(() => {
        const margin = 40;
        const gridHeight = chartSize ? (chartSize.height - margin) / props.processings.length : Math.floor(100 / props.processings.length);

        setChartGrids((grids) => {
            return grids.map((grid, idx) => {
                return {
                    ...grid,
                    height: chartSize ? gridHeight - margin : `${gridHeight}%`,
                    top: chartSize ? margin + gridHeight * idx : `${gridHeight * idx}%`
                };
            });
        });
    }, [chartSize]);

    const parentViz = selectedRange?.processing.parent;
    const selectedRangeDomainMapper = selectedRange ? domainMappers[selectedRange.seriesIndex] : undefined;
    if (loadingState === LoadingState.Init || loadingState === LoadingState.Error) {
        return <AnalysisLoadingStateMessage loadingState={loadingState} initMessage='Fill the series params to retrieve the data' />;
    }

    let enableHistogramRange = false;

    if (
        selectedRange !== undefined &&
        parentViz instanceof RasterMapViz &&
        parentViz.config.bandMode.supportedModes.find((mode) => {
            return mode.type === RasterBandModeType.Single;
        })
    ) {
        const bandConfig = parentViz.config.bandMode.bands?.find((band) => band.id === selectedRange.processing.variable!);

        if (bandConfig && bandConfig.colorScales?.find((scale) => scale.type === ColorScaleType.Parametric)) {
            enableHistogramRange = true;
        }
    }

    return (
        <div className='dataset-stats-analysis'>
            <div className='series-chart'>
                {loadingState === LoadingState.Success && <DatasetAreaValuesProcessingTable processings={props.processings} />}
                <ChartWidget<AreaHistoyramChartOption>
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
                                const processing = props.processings[seriesIndex];
                                const histogramData = processing.data!.stats!.histogram!;
                                const coordRange = [
                                    Math.max(brushArea.coordRange[0], 0),
                                    Math.min(brushArea.coordRange[1], histogramData.length - 1)
                                ];
                                const min = histogramData[coordRange[0]][2];
                                const max = histogramData[coordRange[1]][3];
                                setSelectedRange({ min, max, seriesIndex, processing, brushArea });
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
                            formatter: (analysis) => {
                                return analysis.value
                                    ? `
                                    <div>
                                        <div>${analysis.dimensionNames![0]} range: ${analysis.value[2]} to ${analysis.value[3]}</div>
                                        <div>Count: ${analysis.value ? analysis.value[1] : ''}</div>
                                    </div>
                                `
                                    : '';
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
                    }}
                    isLoading={loadingState === LoadingState.Loading}
                />
            </div>
            {selectedRange && enableHistogramRange && selectedRangeDomainMapper && (
                <div className='dataset-stats-analysis-ops'>
                    <Space>
                        <span>Selected data range: </span>
                        <span>
                            {selectedRangeDomainMapper.formatValue(selectedRange.min, {
                                precision: 2
                            })}
                            ,{' '}
                            {selectedRangeDomainMapper.formatValue(selectedRange.max, {
                                precision: 2
                            })}
                        </span>
                    </Space>
                    <Button
                        onClick={() => {
                            const rasterViz = parentViz as RasterMapViz;

                            const bandMode = rasterViz.bandMode.value;

                            if (bandMode?.type === RasterBandModeType.Single) {
                                bandMode.setBand(selectedRange.processing.variable!);

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
                                const bandConfig = rasterViz.config.bandMode.bands?.find(
                                    (band) => band.id === selectedRange.processing.variable!
                                );

                                if (bandConfig && bandConfig.colorScales) {
                                    rasterViz.bandMode.setValue({
                                        type: RasterBandModeType.Single,
                                        band: selectedRange.processing.variable!,
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

                            selectedRange.processing.dimensions.values.forEach((value, key) => {
                                if (key === 'time') {
                                    selectedRange.processing.dataset.setToi(value as Date);
                                } else {
                                    rasterViz.dimensions.setValue(key, value);
                                }
                            });
                        }}
                    >
                        Apply settings to map visualization
                    </Button>
                </div>
            )}
        </div>
    );
};
