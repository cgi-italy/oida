import React, { useState } from 'react';
import { useObserver } from 'mobx-react';

import { Button, Form } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetDomainSeries, DOMAIN_SERIES_TYPE, DatasetVariable } from '@oida/eo';
import { NumericRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { DatasetSeriesFilters, DatasetSeriesChartWidget } from './dataset-series-chart-widget';


export type DatasetDomainSeriesProps = {
    range?: {start: number, end: number}
    onRangeChange?: (range) => void;
    dataDomain?: DatasetVariable<number>;
    series: IDatasetDomainSeries[];
    onSeriesAdd?: () => void;
};

export const DatasetDomainSeriesChart = (props: DatasetDomainSeriesProps) => {

    let range, onRangeChange;

    let [localRange, setLocalRange] = useState();

    if (props.range) {
        range = props.range;
        onRangeChange = props.onRangeChange;
    } else {
        range = localRange;
        onRangeChange = (range) => {
            setLocalRange(range);
            if (props.onRangeChange) {
                props.onRangeChange(range);
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

    let dataDomain = props.dataDomain;
    let dataRange = dataDomain ? dataDomain.range : undefined;

    return (
        <div className='dataset-chart'>
            <Form layout='inline'>
                <Form.Item>
                    <NumericRangeFieldRenderer
                        value={{from: range.start, to: range.end}}
                        onChange={(value) => onRangeChange(value ? {start: value.from, end: value.to} : undefined)}
                        config={{
                            min: dataRange ? dataRange.min : undefined,
                            max: dataRange ? dataRange.max : undefined
                        }}
                        rendererConfig={{props: {
                            tipFormatter: (value) => {
                                return props.dataDomain ? `${value} ${props.dataDomain.units}` : value;
                            }
                        }}}
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

DatasetAnalysisWidgetFactory.register(DOMAIN_SERIES_TYPE, (config) => {

    let analysis = config.analysis as IDatasetDomainSeries;
    if (!analysis.variable) {
        analysis.setVariable(analysis.config.variables[0].id);
    }

    let dataDomain = analysis.config.domain.range;
    if (!analysis.range && dataDomain) {
        analysis.setRange({
            start: dataDomain.min,
            end: dataDomain.max
        });
    }

    return <DatasetDomainSeriesChart
        series={[analysis]}
        range={analysis.range}
        dataDomain={analysis.config.domain}
        onRangeChange={(range) => {
            config.analysis.setRange(range);
        }}
    />;
});
