import React, { useState } from 'react';
import { useObserver } from 'mobx-react';

import { Button, Form } from 'antd';

import { IDatasetAnalysis, IDatasetDomainSeries, DOMAIN_SERIES_TYPE, DatasetVariable, isValueDomain } from '@oida/eo';
import { NumericRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { DatasetSeriesFilters, DatasetSeriesChartWidget } from './dataset-series-chart-widget';


export type DatasetDomainSeriesProps = {
    range?: {min: number, max: number}
    onRangeChange?: (range) => void;
    dataDomain?: DatasetVariable<number>;
    analysis: IDatasetAnalysis;
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

    let rangeConfig;
    if (props.dataDomain && props.dataDomain.domain && isValueDomain(props.dataDomain.domain)) {
        rangeConfig = {
            min: props.dataDomain.domain.min,
            max: props.dataDomain.domain.max
        };
    }

    return (
        <div className='dataset-chart'>
            <Form layout='inline' size='small'>
                <Form.Item>
                    <NumericRangeFieldRenderer
                        value={{from: range.min, to: range.max}}
                        onChange={(value) => onRangeChange(value ? {min: value.from, max: value.to} : undefined)}
                        config={rangeConfig}
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
                color={color}
            />
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DOMAIN_SERIES_TYPE, (config) => {

    let analysis: IDatasetAnalysis = config.analysis;

    let series = analysis.datasetViz as IDatasetDomainSeries;

    if (!series.variable) {
        series.setVariable(series.config.variables[0].id);
    }

    let dataDomain = series.config.domain;
    if (!series.range && dataDomain.domain && isValueDomain(dataDomain.domain) ) {
        series.setRange({
            min: dataDomain.domain.min,
            max: dataDomain.domain.max
        });
    }

    return <DatasetDomainSeriesChart
        analysis={analysis}
        series={[series]}
        range={series.range}
        dataDomain={series.config.domain}
        onRangeChange={(range) => {
            series.setRange(range);
        }}
    />;
});
