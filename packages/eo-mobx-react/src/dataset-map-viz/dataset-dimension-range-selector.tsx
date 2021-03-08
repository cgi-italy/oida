import React from 'react';
import { Form } from 'antd';

import { DatasetDimension, DomainRange, ValueDomain, isValueDomain, DataDomain, CategoricalDomain } from '@oida/eo-mobx';
import { NumericRangeFieldRenderer, DateRangeFieldRenderer, SelectEnumRenderer } from '@oida/ui-react-antd';
import { useDatasetDomain } from './use-dataset-domain';

type TimeDimension = DatasetDimension<ValueDomain<Date, number>>;
type ValueDimension = DatasetDimension<ValueDomain<number>>;
type CategoricalDimension = DatasetDimension<CategoricalDomain<number | string>>;

export type DatasetValueRangeSelectorProps = {
    dimension: ValueDimension;
    value?: DomainRange<number>;
    onChange: (value: DomainRange<number> | undefined) => void;
};

export const DatasetValueRangeSelector = (props: DatasetValueRangeSelectorProps) => {

    const units = props.dimension.units ? props.dimension.units : '';

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    return (
        <Form.Item label='Range'>
            <NumericRangeFieldRenderer
                value={props.value ? {
                    from: props.value.min,
                    to: props.value.max
                } : undefined}
                onChange={(value) => props.onChange(value ? {min: value.from, max: value.to} : undefined)}
                config={{
                    min: domain?.min,
                    max: domain?.max,
                    step: domain?.step
                }}
                sliderProps={{
                    tipFormatter: (value) => {
                        return `${value} ${units}`;
                    }
                }}

            />
        </Form.Item>
    );
};

export type DatasetTimeRangeSelectorProps = {
    dimension: TimeDimension;
    value?: DomainRange<Date>;
    onChange: (value: DomainRange<Date> | undefined) => void;
};

export const DatasetTimeRangeSelector = (props: DatasetTimeRangeSelectorProps) => {

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    return (
        <Form.Item label='Range'>
            <DateRangeFieldRenderer
                value={props.value ? {
                    start: props.value.min,
                    end: props.value.max
                } : undefined}
                onChange={(value) => props.onChange(value ? {
                    min: value.start,
                    max: value.end
                } : undefined)}
                config={{
                    withTime: true,
                    minDate: domain?.min,
                    maxDate: domain?.max
                }}
            />
        </Form.Item>
    );
};

export type DatasetCategoricalRangeSelectorProps = {
    dimension: CategoricalDimension;
    value?: string[];
    onChange: (value: string[]) => void;
};

export const DatasetCategoricalRangeSelector = (props: DatasetCategoricalRangeSelectorProps) => {

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    if (!domain) {
        return null;
    }

    return (
        <Form.Item label='Range'>
            <SelectEnumRenderer
                value={props.value}
                onChange={(value) => props.onChange(value as string[])}
                config={{
                    choices: domain.map(domainValue => {
                        return {
                            name: domainValue.label || domainValue.value.toString(),
                            value: domainValue.value.toString()
                        };
                    }),
                    multiple: true
                }}
            />
        </Form.Item>
    );
};

export type DatasetDimensionRangeProps = {
    dimension: DatasetDimension<DataDomain<number | Date | string>>;
    value?: DomainRange<number | Date | string>;
    onChange: (value: DomainRange<Date | number> | undefined) => void;
};

export const DatasetDimensionRangeSelector = (props: DatasetDimensionRangeProps) => {

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    const dimension = {
        ...props.dimension,
        domain: domain
    };

    if (!domain) {
        if (props.dimension.id === 'time') {
            return (
                <DatasetTimeRangeSelector
                    dimension={dimension as TimeDimension}
                    value={props.value as DomainRange<Date>}
                    onChange={props.onChange}
                />
            );
        } else {
            return (
                <DatasetValueRangeSelector
                    dimension={dimension as ValueDimension}
                    value={props.value as DomainRange<number>}
                    onChange={props.onChange}
                />
            );
        }
    }


    if (isValueDomain(domain)) {
        if (domain.min instanceof Date) {
            return (
                <DatasetTimeRangeSelector
                    dimension={dimension as TimeDimension}
                    value={props.value as DomainRange<Date>}
                    onChange={props.onChange}
                />
            );
        } else {
            return (
                <DatasetValueRangeSelector
                    dimension={dimension as ValueDimension}
                    value={props.value as DomainRange<number>}
                    onChange={props.onChange}
                />
            );
        }
    } else {
        return null;
        // return (
        //     <DatasetCategoricalRangeSelector
        //         dimension={dimension as CategoricalDimension}
        //         value={props.value as string[]}
        //         onChange={props.onChange}
        //     />
        // );
    }
};
