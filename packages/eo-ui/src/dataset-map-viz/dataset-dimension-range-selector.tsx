import React, { useEffect, useState } from 'react';
import { Form } from 'antd';

import { DatasetDimension, DomainRange, ValueDomain, isValueDomain, DataDomain } from '@oida/eo';
import { NumericRangeFieldRenderer, DateRangeFieldRenderer } from '@oida/ui-react-antd';

type TimeDimension = DatasetDimension<ValueDomain<Date>> & {domain: ValueDomain<Date>};
type ValueDimension = DatasetDimension<ValueDomain<number>> & {domain: ValueDomain<number>};

export type DatasetValueDimensionSelectorProps = {
    dimension: ValueDimension;
    value?: DomainRange<number>;
    onChange: (value: DomainRange<number> | undefined) => void;
};

export const DatasetValueRangeSelector = (props: DatasetValueDimensionSelectorProps) => {

    const units = props.dimension.units ? props.dimension.units : '';

    return (
        <Form.Item label='Range'>
            <NumericRangeFieldRenderer
                value={props.value ? {
                    from: props.value.min,
                    to: props.value.max
                } : undefined}
                onChange={(value) => props.onChange(value ? {min: value.from, max: value.to} : undefined)}
                config={{
                    min: props.dimension.domain.min,
                    max: props.dimension.domain.max,
                    step: props.dimension.domain.step
                }}
                rendererConfig={{props: {
                    tipFormatter: (value) => {
                        return `${value} ${units}`;
                    }
                }}}
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
                    minDate: props.dimension.domain.min,
                    maxDate: props.dimension.domain.max
                }}
            />
        </Form.Item>
    );
};


export type DatasetDimensionRangeProps = {
    dimension: DatasetDimension<DataDomain<number | Date | string>>;
    value?: DomainRange<number | Date | string>
    onChange: (value: DomainRange<Date | number> | undefined) => void;
};

export const DatasetDimensionRangeSelector = (props: DatasetDimensionRangeProps) => {

    const [domain, setDomain] = useState(props.dimension.domain);
    useEffect(() => {
        if (!domain && props.dimension.domainProvider) {
            props.dimension.domainProvider().then((d) => {
                setDomain(d);
            });
        }
    });

    if (!domain) {
        return null;
    }

    const dimension = {
        ...props.dimension,
        domain: domain
    };

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
    }
};
