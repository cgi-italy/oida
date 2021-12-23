import React, { useState, useEffect, useRef } from 'react';
import download from 'downloadjs';

import echarts, { EChartOption } from 'echarts/lib/echarts';
import useResizeAware from 'react-resize-aware';

import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

//TODO: move chart export code out of here

export type ChartWidgetProps = {
    options: echarts.EChartOption;
    isLoading?: boolean;
    showTip?: {
        x?: number;
        y?: number;
        position?: echarts.EChartOption.Tooltip.Position.Type;
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

export const ChartWidget = (props: ChartWidgetProps) => {
    const [resizeListener, size] = useResizeAware();

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
                chartInstance.off('highlight', onHighlightEvt);
                chartInstance.off('downplay', onDownPlayEvt);
            };
        }
    }, [chart, props.onHighlight]);

    useEffect(() => {
        const onItemClick = props.onItemClick;
        const chartInstance = chart;

        if (chartInstance && onItemClick) {
            chartInstance.on('click', onItemClick);
            return () => {
                chartInstance.off('click', onItemClick);
            };
        }
    }, [chart, props.onItemClick]);

    useEffect(() => {
        if (chart) {
            if (props.options) {
                const currentOptions = chart.getOption();
                let yAxis = props.options.yAxis;
                // automatically set the number of split lines (parallel to xAxis) based on the chart height
                if (Array.isArray(props.options.yAxis)) {
                    yAxis = props.options.yAxis.map((axisConfig) => {
                        return {
                            ...axisConfig,
                            splitNumber: Math.floor(size.height / 80)
                        };
                    });
                }
                // keep the data zoom current state
                let dataZoom = props.options.dataZoom;
                const currentZoom = currentOptions?.dataZoom;
                if (dataZoom && currentZoom && dataZoom.length === currentZoom.length) {
                    dataZoom = dataZoom.map((item, idx) => {
                        return {
                            ...item,
                            start: item.start || currentZoom[idx].start,
                            end: item.end || currentZoom[idx].end
                        };
                    });
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
                                splitNumber: Math.floor(size.height / 80)
                            };
                        })
                    },
                    false,
                    true
                );
            }
            if (props.onSizeChange) {
                props.onSizeChange(size);
            }
        }
    }, [size]);

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
                    if (chart) {
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
                chart!.dispatchAction({
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
                chartInstance.off('brushEnd', onBrushSelected);
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
                chartInstance.off('datazoom', onDataZoom);
            };
        }
    }, [chart, props.onDataZoom]);

    useEffect(() => {
        const onLegendItemSelection = props.onLegendItemSelection;
        const chartInstance = chart;

        if (chartInstance && onLegendItemSelection) {
            chartInstance.on('legendselectchanged', onLegendItemSelection);
            return () => {
                chartInstance.off('legendselectchanged', onLegendItemSelection);
            };
        }
    }, [chart, props.onLegendItemSelection]);

    return (
        <React.Fragment>
            <div className='chart' onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}>
                {resizeListener}
                <div style={{ width: '100%', height: '100%' }} ref={chartContainer}></div>
            </div>
            <div className='chart-ops'>
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item>
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
                            </Menu.Item>
                            <Menu.Item>
                                <a
                                    onClick={(evt) => {
                                        if (chartContainer.current) {
                                            let csvData;
                                            const series: EChartOption.SeriesLine | undefined = props.options.series
                                                ? (props.options.series[0] as EChartOption.SeriesLine)
                                                : undefined;

                                            if (series) {
                                                const xAxis = props.options.xAxis![series.xAxisIndex || 0];

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
                            </Menu.Item>
                        </Menu>
                    }
                >
                    <a className='ant-dropdown-link'>
                        Export <DownOutlined />
                    </a>
                </Dropdown>
            </div>
        </React.Fragment>
    );
};
