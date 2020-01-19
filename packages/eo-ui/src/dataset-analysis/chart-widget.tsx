import React, { useState, useEffect, useRef } from 'react';

import echarts from 'echarts/lib/echarts';
import useResizeAware from 'react-resize-aware';

export type ChartWidgetProps = {
    options: echarts.EChartOption | echarts.EChartsResponsiveOption,
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
    </div>;
};
