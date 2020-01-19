import React, { useState } from 'react';
import { useObserver } from 'mobx-react';

import { Button, Form } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetTimeSeries, TIME_SERIES_TYPE } from '@oida/eo';
import { DateRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { DatasetSeriesFilters, DatasetSeriesChartWidget } from './dataset-series-chart-widget';


export type DatasetTimeSeriesProps = {
    timeRange?: {start: Date, end: Date}
    onTimeRangeChange?: (timeRange) => void;
    timeDomain?: {min: Date, max: Date}
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
                />
                {props.onSeriesAdd && idx === lastSeriesIdx &&
                    <Button
                        onClick={() => props.onSeriesAdd!()}
                    >Add</Button>
                }
            </React.Fragment>
        );
    });

    return (
        <div className='dataset-chart'>
            <Form layout='inline'>
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
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(TIME_SERIES_TYPE, (config) => {

    let analysis = config.analysis as IDatasetTimeSeries;
    if (!analysis.variable) {
        analysis.setVariable(analysis.config.variables[0].id);
    }
    if (!analysis.range) {
        let toi = analysis.dataset.searchParams.filters.get('time');
        if (toi) {
            let start = new Date(toi.end.getTime());
            start.setMonth(start.getMonth() - 1);
            analysis.setRange({
                start: start,
                end: toi.end
            });
        } else if (analysis.dataset.config!.timeDistribution) {
            let timeProvider = analysis.dataset.config!.timeDistribution.provider;
            timeProvider.getTimeExtent({}).then((range) => {
                if (range) {
                    analysis.setRange({
                        start: range.start,
                        end: range.end
                    });
                }
            });
        }
    }
    return <DatasetTimeSeriesChart
        series={[analysis]}
        timeRange={analysis.range}
        onTimeRangeChange={(range) => {
            config.analysis.setRange(range);
        }}
    />;
});
