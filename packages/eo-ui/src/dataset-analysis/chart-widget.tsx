import React, { useState, useEffect, useRef } from 'react';
import download from 'downloadjs';

import echarts, { EChartOption } from 'echarts/lib/echarts';
import useResizeAware from 'react-resize-aware';

import { Menu, Dropdown, Icon } from 'antd';

//TODO: move chart export code out of here

export type ChartWidgetProps = {
    options: echarts.EChartOption,
    isLoading?: boolean
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
        if (chart) {
            chart.setOption(props.options);
        }
    }, [chart, props.options]);

    useEffect(() => {
        if (chart) {
            chart.setOption({
                yAxis: {
                    splitNumber: Math.floor(size.height / 80)
                }
            });
            chart.resize();
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

    return <div className='chart'>
        {resizeListener}
        <div style={{width: '100%', height: '100%'}}
            ref={chartContainer}
        >
        </div>
        <div className='chart-ops'>
            <Dropdown overlay={
                <Menu>
                    <Menu.Item>
                        <a onClick={(evt) => {
                            if (chartContainer.current) {
                                let canvas = chartContainer.current.getElementsByTagName('canvas')[0];
                                let img = canvas.toDataURL('image/png');
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
                    Export <Icon type='down' />
                </a>
            </Dropdown>
        </div>
    </div>;
};
