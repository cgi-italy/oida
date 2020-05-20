import React, { useState } from 'react';
import { useObserver } from 'mobx-react';

import { Button, Form } from 'antd';

import { IDatasetAnalysis, IDatasetTimeSeries, TIME_SERIES_TYPE } from '@oida/eo';
import { DateRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { DatasetSeriesFilters, DatasetSeriesChartWidget } from './dataset-series-chart-widget';


export type DatasetTimeSeriesProps = {
    timeRange?: {start: Date, end: Date}
    onTimeRangeChange?: (timeRange) => void;
    timeDomain?: {min: Date, max: Date}
    analysis: IDatasetAnalysis;
    series: IDatasetTimeSeries[];
    onSeriesAdd?: () => void;
};

export const DatasetTimeSeriesChart = (props: DatasetTimeSeriesProps) => {

    let timeRange, onTimeRangeChange;

    let [localTimeRange, setLocalTimeRange] = useState();

    if (props.timeRange) {
        timeRange = props.timeRange;
        onTimeRangeChange = props.onTimeRangeChange;
    } else {
        timeRange = localTimeRange;
        onTimeRangeChange = (range) => {
            setLocalTimeRange(range);
            if (props.onTimeRangeChange) {
                props.onTimeRangeChange(range);
            }
        };
    }

    let lastSeriesIdx = props.series.length - 1;

    let seriesFilters = props.series.map((series, idx) => {
        return (
            <React.Fragment key={series.dataset.id}>
                <DatasetSeriesFilters
                    key={series.dataset.id}
                    series={series}
                    analysis={props.analysis}
                />
                {props.onSeriesAdd && idx === lastSeriesIdx &&
                    <Button
                        onClick={() => props.onSeriesAdd!()}
                    >Add</Button>
                }
            </React.Fragment>
        );
    });

    let color = useObserver(() => props.analysis.color);

    return (
        <div className='dataset-chart'>
            <Form layout='inline' size='small'>
                <Form.Item>
                    <DateRangeFieldRenderer
                        value={timeRange}
                        onChange={onTimeRangeChange}
                        config={{
                            minDate: props.timeDomain ? props.timeDomain.min : undefined,
                            maxDate: props.timeDomain ? props.timeDomain.max : undefined
                        }}
                    />
                </Form.Item>
                {seriesFilters}
            </Form>
            <DatasetSeriesChartWidget
                series={props.series}
                color={color}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TIME_SERIES_TYPE, (config) => {

    let analysis = config.analysis as IDatasetAnalysis;
    let timeSeriesViz = analysis.datasetViz as IDatasetTimeSeries;
    if (!timeSeriesViz.variable) {
        timeSeriesViz.setVariable(timeSeriesViz.config.variables[0].id);
    }
    if (!timeSeriesViz.range) {
        let toi = timeSeriesViz.dataset.searchParams.filters.get('time');
        if (toi) {
            let start = new Date(toi.end.getTime());
            start.setMonth(start.getMonth() - 1);
            timeSeriesViz.setRange({
                start: start,
                end: toi.end
            });
        } else if (timeSeriesViz.dataset.config!.timeDistribution) {
            let timeProvider = timeSeriesViz.dataset.config!.timeDistribution.provider;
            timeProvider.getTimeExtent({}).then((range) => {
                if (range) {
                    timeSeriesViz.setRange({
                        start: range.start,
                        end: range.end
                    });
                }
            });
        }
    }
    return <DatasetTimeSeriesChart
        series={[timeSeriesViz]}
        analysis={analysis}
        timeRange={timeSeriesViz.range}
        onTimeRangeChange={(range) => {
            timeSeriesViz.setRange(range);
        }}
    />;
});
