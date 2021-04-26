import React, { useEffect, useState } from 'react';

import { Slider, Select, Input, InputNumber } from 'antd';

import { DatasetDimensions, DatasetDimension, ValueDomain, CategoricalDomain, isValueDomain, DataDomain, isDomainProvider } from '@oida/eo-mobx';
import { DateFieldRenderer } from '@oida/ui-react-antd';
import { useSelector } from '@oida/ui-react-mobx';
import { useDatasetDomain } from './use-dataset-domain';

type TimeDimension = DatasetDimension<ValueDomain<Date>>;
type ValueDimension = DatasetDimension<ValueDomain<number>>;
type CategoricalDimension = DatasetDimension<CategoricalDomain<number | string>>;

export type DatasetValueDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: ValueDimension;
};

export const DatasetValueDimensionSelector = (props: DatasetValueDimensionSelectorProps) => {

    const value = useSelector(() => {
        let val = props.dimensionsState.values.get(props.dimension.id);
        return val ? val as number : undefined;
    });

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    if (!domain) {
        return null;
    }

    if (domain.min !== undefined && domain.max !== undefined) {

        let marks = {
            [domain.min]: `${domain.min} ${props.dimension.units}`,
            [domain.max]: `${domain.max} ${props.dimension.units}`,
        };

        return (
            <div className='dataset-dimension-value-selector dataset-slider-selector'>
                <span>{props.dimension.name}: </span>
                <Slider
                    min={domain.min}
                    max={domain.max}
                    step={domain.step}
                    value={value}
                    marks={marks}
                    onChange={(value) => props.dimensionsState.setValue(props.dimension.id, value as number)}
                    tipFormatter={(value) => `${value} ${props.dimension.units}`}
                />
            </div>
        );
    } else {
        return (
            <div className='dataset-dimension-value-selector'>
                <span>{props.dimension.name}: </span>
                <InputNumber
                    value={value}
                    onChange={(value) => props.dimensionsState.setValue(props.dimension.id, value)}
                />
            </div>
        );
    }
};

export type DatasetTimeDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: TimeDimension;
};

export const DatasetTimeDimensionSelector = (props: DatasetTimeDimensionSelectorProps) => {

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    const value = useSelector(() => {
        let val = props.dimensionsState.values.get(props.dimension.id);
        return val ? val as Date : undefined;
    });

    useEffect(() => {
        if (domain) {
            let val = props.dimensionsState.values.get(props.dimension.id);
            if (domain.min !== undefined && (!val || val < domain.min)) {
                props.dimensionsState.setValue(props.dimension.id, domain.min);
            } else if (domain.max !== undefined && (!val || val > domain.max)) {
                props.dimensionsState.setValue(props.dimension.id, domain.max);
            }
        }
    }, [domain]);


    return (
        <div className='dataset-dimension-value-selector'>
            <span>{props.dimension.name}: </span>
            <DateFieldRenderer
                value={value}
                onChange={(value) => props.dimensionsState.values.set(props.dimension.id, value as Date)}
                required={true}
                config={{
                    minDate: domain ? domain.min : undefined,
                    maxDate: domain ? domain.max : undefined,
                    withTime: true
                }}
            />
        </div>
    );
};

export type DatasetCategoricalDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: CategoricalDimension;
};

export const DatasetCategoricalDimensionSelector = (props: DatasetCategoricalDimensionSelectorProps) => {

    const value = useSelector(() => {
        return props.dimensionsState.values.get(props.dimension.id) as (string | number);
    });

    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    if (!domain) {
        return null;
    }

    const domainOptions = domain.values.map((item) => {
        return (<Select.Option key={item.value} value={item.value}>{item.label || item.value}</Select.Option>);
    });

    return (
        <div className='dataset-dimension-value-selector dataset-combo-selector'>
            <span>{props.dimension.name}: </span>
            <Select
                value={value}
                placeholder='Select value'
                onChange={(value) => {
                    props.dimensionsState.setValue(props.dimension.id, value);
                }}
            >
                {domainOptions}
            </Select>
        </div>
    );
};


export type DatasetDimensionSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: DatasetDimension<DataDomain<number | string | Date>>;
};

export const DatasetDimensionValueSelector = (props: DatasetDimensionSelectorProps) => {

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
                <DatasetTimeDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={dimension as TimeDimension}
                />
            );
        } else {
            return null;
        }
    }

    if (isValueDomain(domain)) {
        if (domain.min instanceof Date) {
            return (
                <DatasetTimeDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={dimension as TimeDimension}
                />
            );
        } else {
            return (
                <DatasetValueDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={dimension as ValueDimension}
                />
            );
        }
    } else {
        return (
            <DatasetCategoricalDimensionSelector
                dimensionsState={props.dimensionsState}
                dimension={dimension as CategoricalDimension}
            />
        );
    }
};
