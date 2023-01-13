import React, { useState, useEffect, useRef } from 'react';
import download from 'downloadjs';

import * as echarts from 'echarts/core';

import { LineSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { DataZoomComponent, DataZoomComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components';

import useDimensions from 'react-cool-dimensions';

import { Dropdown, MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';

echarts.use([CanvasRenderer, DataZoomComponent, TooltipComponent]);

//TODO: move chart export code out of here

export type ChartWidgetBaseOptions = echarts.ComposeOption<DataZoomComponentOption | TooltipComponentOption>;

export type ChartWidgetProps<OPT extends ChartWidgetBaseOptions = ChartWidgetBaseOptions> = {
    options: OPT;
    isLoading?: boolean;
    showTip?: {
        x?: number;
        y?: number;
        position?: TooltipComponentOption['position'];
        seriesIndex?: number;
        dataIndex?: number;
        name?: string;
    };
    highlightedSeries?: number;
    brushMode?: 'none' | 'rect' | 'polygon' | 'lineX' | 'lineY';
    onBrushEnd?: (evt) => void;
    brushArea?: any;
    onDataZoom?: (evt) => void;
    onMouseEnter?: (evt) => void;
    onMouseLeave?: (evt) => void;
    onItemClick?: (evt) => void;
    onHighlight?: (evt, highlighted?: boolean) => void;
    onLegendItemSelection?: (evt) => void;
    onSizeChange?: (size: { width: number; height: number }) => void;
};

export const ChartWidget = <OPT extends ChartWidgetBaseOptions = ChartWidgetBaseOptions>(props: ChartWidgetProps<OPT>) => {
    const { observe, width, height } = useDimensions();

    const chartContainer = useRef<HTMLDivElement>(null);

    const [chart, setChart] = useState<echarts.ECharts>();

    useEffect(() => {
        if (chartContainer.current) {
            const chartInstance = echarts.init(chartContainer.current, 'dark');
            setChart(chartInstance);

            return () => {
                chartInstance.dispose();
            };
        }
    }, [chartContainer]);

    useEffect(() => {
        const onHighlight = props.onHighlight;
        const chartInstance = chart;

        if (chartInstance && onHighlight) {
            const onHighlightEvt = (evt) => {
                onHighlight(evt, true);
            };
            const onDownPlayEvt = (evt) => {
                onHighlight(evt, false);
            };

            chartInstance.on('highlight', onHighlightEvt);
            chartInstance.on('downplay', onDownPlayEvt);
            return () => {
                if (!chartInstance.isDisposed()) {
                    chartInstance.off('highlight', onHighlightEvt);
                    chartInstance.off('downplay', onDownPlayEvt);
                }
            };
        }
    }, [chart, props.onHighlight]);

    useEffect(() => {
        const onItemClick = props.onItemClick;
        const chartInstance = chart;

        if (chartInstance && onItemClick) {
            chartInstance.on('click', onItemClick);
            return () => {
                if (!chartInstance.isDisposed()) {
                    chartInstance.off('click', onItemClick);
                }
            };
        }
    }, [chart, props.onItemClick]);

    useEffect(() => {
        if (chart) {
            if (props.options) {
                let yAxis = props.options.yAxis;
                // automatically set the number of split lines (parallel to xAxis) based on the chart height
                if (Array.isArray(props.options.yAxis)) {
                    yAxis = props.options.yAxis.map((axisConfig) => {
                        return {
                            ...axisConfig,
                            splitNumber: Math.floor((height || 0) / 80)
                        };
                    });
                }
                // keep the data zoom current state
                let dataZoom: DataZoomComponentOption[] = [];
                if (Array.isArray(props.options.dataZoom)) {
                    dataZoom = props.options.dataZoom;
                } else if (props.options.dataZoom) {
                    dataZoom = [props.options.dataZoom];
                }

                const currentOptions = chart.getOption() as OPT;
                if (currentOptions) {
                    const currentZoom: DataZoomComponentOption[] = [];
                    if (Array.isArray(currentOptions.dataZoom)) {
                        currentZoom.push(...currentOptions.dataZoom);
                    } else if (currentOptions.dataZoom) {
                        currentZoom.push(currentOptions.dataZoom);
                    }
                    if (dataZoom && currentZoom && dataZoom.length === currentZoom.length) {
                        dataZoom = dataZoom.map((item, idx) => {
                            return {
                                ...item,
                                start: item.start || currentZoom[idx].start,
                                end: item.end || currentZoom[idx].end
                            };
                        });
                    }
                }
                chart.setOption(
                    {
                        ...props.options,
                        yAxis,
                        dataZoom
                    },
                    true,
                    false
                );
            }
            // reapply brush state
            if (props.brushMode && props.brushMode !== 'none') {
                chart!.dispatchAction({
                    type: 'takeGlobalCursor',
                    key: 'brush',
                    brushOption: {
                        brushType: props.brushMode,
                        brushMode: 'single'
                    }
                });
            }
            if (props.brushArea) {
                chart!.dispatchAction({
                    type: 'brush',
                    areas: [props.brushArea]
                });
            }
        }
    }, [chart, props.options]);

    useEffect(() => {
        if (chart) {
            chart.resize();
            if (props.options && Array.isArray(props.options.yAxis)) {
                chart.setOption(
                    {
                        yAxis: props.options.yAxis.map((axisConfig) => {
                            return {
                                ...axisConfig,
                                splitNumber: Math.floor((height || 0) / 80)
                            };
                        })
                    },
                    false,
                    true
                );
            }
            if (props.onSizeChange) {
                props.onSizeChange({
                    width: width || 0,
                    height: height || 0
                });
            }
        }
    }, [width, height]);

    useEffect(() => {
        if (chart) {
            if (props.isLoading) {
                chart.showLoading('default', {
                    maskColor: 'rgba(0, 0, 0, 0.6)',
                    textColor: 'white'
                });
            } else {
                chart.hideLoading();
            }
        }
    }, [chart, props.isLoading]);

    useEffect(() => {
        if (chart) {
            if (!props.showTip) {
                chart.dispatchAction({
                    type: 'hideTip'
                });
                chart.dispatchAction({
                    type: 'downplay'
                });
            } else {
                chart.dispatchAction({
                    type: 'showTip',
                    ...props.showTip
                });
            }
        }
    }, [props.showTip]);

    useEffect(() => {
        if (chart) {
            const highlightedSeries = props.highlightedSeries;
            if (highlightedSeries !== undefined) {
                chart.dispatchAction({
                    type: 'highlight',
                    seriesIndex: highlightedSeries
                });
                return () => {
                    if (chart && !chart.isDisposed()) {
                        chart.dispatchAction({
                            type: 'downplay',
                            seriesIndex: highlightedSeries
                        });
                    }
                };
            }
        }
    }, [props.highlightedSeries]);

    useEffect(() => {
        if (chart) {
            if (props.brushMode && props.brushMode !== 'none') {
                chart.dispatchAction({
                    type: 'takeGlobalCursor',
                    key: 'brush',
                    brushOption: {
                        brushType: props.brushMode,
                        brushMode: 'single'
                    }
                });
            } else {
                chart.dispatchAction({
                    type: 'takeGlobalCursor',
                    key: undefined
                });

                chart.dispatchAction({
                    type: 'brush',
                    command: 'clear',
                    areas: []
                });
            }
        }
    }, [chart, props.brushMode]);

    useEffect(() => {
        const onBrushSelected = props.onBrushEnd;
        const chartInstance = chart;

        if (chartInstance && onBrushSelected) {
            chartInstance.on('brushEnd', onBrushSelected);
            return () => {
                if (!chartInstance.isDisposed()) {
                    chartInstance.off('brushEnd', onBrushSelected);
                }
            };
        }
    }, [chart, props.onBrushEnd]);

    useEffect(() => {
        const chartInstance = chart;
        if (chartInstance && props.brushArea) {
            chartInstance.dispatchAction({
                type: 'brush',
                areas: [props.brushArea]
            });
        }
    }, [chart, props.brushArea]);

    useEffect(() => {
        const onDataZoom = props.onDataZoom;
        const chartInstance = chart;

        if (chartInstance && onDataZoom) {
            chartInstance.on('datazoom', onDataZoom);
            return () => {
                if (!chartInstance.isDisposed()) {
                    chartInstance.off('datazoom', onDataZoom);
                }
            };
        }
    }, [chart, props.onDataZoom]);

    useEffect(() => {
        const onLegendItemSelection = props.onLegendItemSelection;
        const chartInstance = chart;

        if (chartInstance && onLegendItemSelection) {
            chartInstance.on('legendselectchanged', onLegendItemSelection);
            return () => {
                if (!chartInstance.isDisposed()) {
                    chartInstance.off('legendselectchanged', onLegendItemSelection);
                }
            };
        }
    }, [chart, props.onLegendItemSelection]);

    const exportMenuItems: MenuProps['items'] = [
        {
            key: 'png',
            label: (
                <a
                    onClick={(evt) => {
                        if (chart) {
                            const img = chart.getDataURL({
                                type: 'png'
                            });
                            download(img, 'chart.png', 'image/png');
                        }
                    }}
                >
                    PNG
                </a>
            )
        },
        {
            key: 'csv',
            label: (
                <a
                    onClick={(evt) => {
                        if (chartContainer.current) {
                            let csvData;
                            const series = Array.isArray(props.options.series) ? props.options.series[0] : props.options.series;

                            if (series) {
                                // @ts-ignore
                                const xAxis = props.options.xAxis![(series as LineSeriesOption).xAxisIndex || 0];

                                csvData = `${xAxis.name},${series.name}\n`;

                                const csvLines = (series.data as number[]).map((item) => {
                                    if (item[0] instanceof Date) {
                                        return `${item[0].toISOString()},${item[1]}`;
                                    } else {
                                        return `${item[0]},${item[1]}`;
                                    }
                                });

                                csvData += csvLines.join('\n');

                                download(csvData, 'chart.csv', 'text/csv');
                            }
                        }
                    }}
                >
                    CSV
                </a>
            )
        }
    ];
    return (
        <React.Fragment>
            <div className='chart' onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave} ref={observe}>
                <div style={{ width: '100%', height: '100%' }} ref={chartContainer}></div>
            </div>
            <div className='chart-ops'>
                <Dropdown menu={{ items: exportMenuItems }}>
                    <a className='ant-dropdown-link'>
                        Export <DownOutlined />
                    </a>
                </Dropdown>
            </div>
        </React.Fragment>
    );
};
