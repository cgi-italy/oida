import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';

import { Slider, Select } from 'antd';

import { IHasDimensions, DatasetDimension, ValueDomain, CategoricalDomain, isValueDomain, DataDomain } from '@oida/eo';
import { DateFieldRenderer } from '@oida/ui-react-antd';

type TimeDimension = DatasetDimension<ValueDomain<Date>>;
type ValueDimension = DatasetDimension<ValueDomain<number>> & {domain: ValueDomain<number>};
type CategoricalDimension = DatasetDimension<CategoricalDomain<number | string>> & {domain: CategoricalDomain<number | string>};

export type DatasetValueDimensionSelectorProps = {
    dimensionsState: IHasDimensions;
    dimension: ValueDimension;
};

export const DatasetValueDimensionSelector = (props: DatasetValueDimensionSelectorProps) => {

    const value = useObserver(() => {
        let val = props.dimensionsState.dimensionValues.get(props.dimension.id);
        return val ? val as number : undefined;
    });

    const domain = props.dimension.domain;

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
                onChange={(value) => props.dimensionsState.setDimensionValue(props.dimension.id, value as number)}
                tipFormatter={(value) => `${value} ${props.dimension.units}`}
            />
        </div>
    );
};

export type DatasetTimeDimensionSelectorProps = {
    dimensionsState: IHasDimensions;
    dimension: TimeDimension;
};

export const DatasetTimeDimensionSelector = (props: DatasetTimeDimensionSelectorProps) => {

    const [domain, setDomain] = useState(props.dimension.domain);

    useEffect(() => {
        if (!domain && props.dimension.domainProvider) {
            props.dimension.domainProvider().then(domainRange => {
                setDomain(domainRange);
                let val = props.dimensionsState.dimensionValues.get(props.dimension.id);
                if (!val || val < domainRange.min) {
                    props.dimensionsState.setDimensionValue(props.dimension.id, domainRange.min);
                } else if (val > domainRange.max) {
                    props.dimensionsState.setDimensionValue(props.dimension.id, domainRange.max);
                }
            });
        }
    });

    const value = useObserver(() => {
        let val = props.dimensionsState.dimensionValues.get(props.dimension.id);
        return val ? val as Date : undefined;
    });

    return (
        <div className='dataset-dimension-value-selector'>
            <span>{props.dimension.name}: </span>
            <DateFieldRenderer
                value={value}
                onChange={(value) => props.dimensionsState.setDimensionValue(props.dimension.id, value)}
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
    dimensionsState: IHasDimensions;
    dimension: CategoricalDimension;
};

export const DatasetCategoricalDimensionSelector = (props: DatasetCategoricalDimensionSelectorProps) => {

    const value = useObserver(() => {
        return props.dimensionsState.dimensionValues.get(props.dimension.id) as (string | number);
    });

    const domain = props.dimension.domain;

    const domainOptions = domain.map((item) => {
        return (<Select.Option key={item.value} value={item.value}>{item.label || item.value}</Select.Option>);
    });

    return (
        <div className='dataset-dimension-value-selector dataset-combo-selector'>
            <span>{props.dimension.name}: </span>
            <Select
                value={value}
                placeholder='Select value'
                onChange={(value) => {
                    props.dimensionsState.setDimensionValue(props.dimension.id, value);
                }}
            >
                {domainOptions}
            </Select>
        </div>
    );
};


export type DatasetDimensionSelectorProps = {
    dimensionsState: IHasDimensions;
    dimension: DatasetDimension<DataDomain<number | string | Date>>;
};

export const DatasetDimensionValueSelector = (props: DatasetDimensionSelectorProps) => {

    const domain = props.dimension.domain;

    if (!domain) {
        if (props.dimension.id === 'time') {
            return (
                <DatasetTimeDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={props.dimension as TimeDimension}
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
                    dimension={props.dimension as TimeDimension}
                />
            );
        } else {
            return (
                <DatasetValueDimensionSelector
                    dimensionsState={props.dimensionsState}
                    dimension={props.dimension as ValueDimension}
                />
            );
        }
    } else {
        return (
            <DatasetCategoricalDimensionSelector
                dimensionsState={props.dimensionsState}
                dimension={props.dimension as CategoricalDimension}
            />
        );
    }
};
