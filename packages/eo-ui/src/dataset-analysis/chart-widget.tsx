import React, { useState, useEffect, useRef } from 'react';
import download from 'downloadjs';

import echarts, { EChartOption } from 'echarts/lib/echarts';
import useResizeAware from 'react-resize-aware';

import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

//TODO: move chart export code out of here

export type ChartWidgetProps = {
    options: echarts.EChartOption,
    isLoading?: boolean,
    showTip?: {
        x?: number,
        y?: number,
        position?: Array<number>| string | Function
        seriesIndex?: number,
        dataIndex?: number,
        name?: string,
    },
    onMouseEnter?: (evt) => void;
    onMouseLeave?: (evt) => void;
    onItemClick?: (evt) => void;
    onHighlight?: (evt, highlighted?: boolean) => void;
};

export const ChartWidget = (props: ChartWidgetProps) => {

    const [resizeListener, size] = useResizeAware();

    let chartContainer = useRef<HTMLDivElement>(null);

    let [chart, setChart] = useState<echarts.ECharts>();

    useEffect(() => {
        if (chartContainer.current) {
            let chartInstance = echarts.init(chartContainer.current, 'dark');
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
            let clickHandler = (evt) => {
                onItemClick(evt);
            };
            chartInstance.on('click', onItemClick);
            return () => {
                chartInstance.off('click', onItemClick);
            };
        }
    }, [chart, props.onItemClick]);

    useEffect(() => {
        if (chart) {
            if (props.options && Array.isArray(props.options.yAxis)) {
                chart.setOption({
                    ...props.options,
                    yAxis: props.options.yAxis.map(axisConfig => {
                        return {
                            ...axisConfig,
                            splitNumber: Math.floor(size.height / 80)
                        };
                    })
                }, true, false);
            } else {
                chart.setOption(props.options, true, false);
            }
        }
    }, [chart, props.options]);

    useEffect(() => {
        if (chart) {
            chart.resize();
            if (props.options && Array.isArray(props.options.yAxis)) {
                chart.setOption({
                    yAxis: props.options.yAxis.map(axisConfig => {
                        return {
                            ...axisConfig,
                            splitNumber: Math.floor(size.height / 80)
                        };
                    })
                });
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

    return (
        <React.Fragment>
            <div className='chart'
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                {resizeListener}
                <div style={{width: '100%', height: '100%'}}
                    ref={chartContainer}
                >
                </div>

            </div>
            <div className='chart-ops'>
                <Dropdown overlay={
                    <Menu>
                        <Menu.Item>
                            <a onClick={(evt) => {
                                if (chart) {
                                    let img = chart.getDataURL({
                                        type: 'png'
                                    });
                                    download(img, 'chart.png', 'image/png');
                                }
                            }}>PNG</a>
                        </Menu.Item>
                        <Menu.Item>
                            <a onClick={(evt) => {
                                if (chartContainer.current) {

                                    let csvData;
                                    let series: EChartOption.SeriesLine | undefined = props.options.series
                                        ? props.options.series[0] as EChartOption.SeriesLine
                                        : undefined;

                                    if (series) {
                                        let xAxis = props.options.xAxis![series.xAxisIndex || 0];

                                        csvData = `${xAxis.name},${series.name}\n`;

                                        let csvLines = (series.data as number[]).map((item) => {
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

                            }}>CSV</a>
                        </Menu.Item>
                    </Menu>
                }
                >
                    <a className='ant-dropdown-link'>
                        Export <DownOutlined/>
                    </a>
                </Dropdown>
            </div>
        </React.Fragment>
    );
};
