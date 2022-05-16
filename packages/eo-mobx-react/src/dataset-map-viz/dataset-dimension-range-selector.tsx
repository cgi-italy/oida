import React from 'react';
import { Select } from 'antd';

import {
    DatasetDimension,
    DomainRange,
    ValueDomain,
    isValueDomain,
    CategoricalDomain,
    DimensionDomainType,
    DimensionRangeType
} from '@oidajs/eo-mobx';
import { NumericRangeFieldRenderer, DateRangeFieldRenderer } from '@oidajs/ui-react-antd';

import { useDatasetDomain } from './use-dataset-domain';

type TimeDimension = DatasetDimension<ValueDomain<Date, number>>;
type ValueDimension = DatasetDimension<ValueDomain<number>>;
type CategoricalDimension<T extends string | number | Date = string | number | Date> = DatasetDimension<CategoricalDomain<T>>;

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
        <div className='dataset-dimension-range-selector dataset-slider-selector'>
            <span>{props.dimension.name}: </span>
            <NumericRangeFieldRenderer
                value={
                    props.value
                        ? {
                              from: props.value.min,
                              to: props.value.max
                          }
                        : undefined
                }
                onChange={(value) => props.onChange(value ? { min: value.from, max: value.to } : undefined)}
                config={{
                    min: domain?.min,
                    max: domain?.max,
                    step: domain?.step
                }}
                inputInfraContent={props.dimension.units}
                sliderProps={{
                    tipFormatter: (value) => {
                        return `${value} ${units}`;
                    }
                }}
            />
        </div>
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
        <div className='dataset-dimension-range-selector'>
            <span>{props.dimension.name}: </span>
            <DateRangeFieldRenderer
                value={
                    props.value
                        ? {
                              start: props.value.min,
                              end: props.value.max
                          }
                        : undefined
                }
                onChange={(value) =>
                    props.onChange(
                        value
                            ? {
                                  min: value.start,
                                  max: value.end
                              }
                            : undefined
                    )
                }
                config={{
                    withTime: false,
                    minDate: domain?.min,
                    maxDate: domain?.max
                }}
            />
        </div>
    );
};

export type DatasetCategoricalRangeSelectorProps<T extends string | number | Date> = {
    dimension: CategoricalDimension<T>;
    value?: T[] | undefined;
    onChange: (value: T[] | undefined) => void;
};

export const DatasetCategoricalRangeSelector = <T extends string | number | Date>(props: DatasetCategoricalRangeSelectorProps<T>) => {
    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    if (!domain) {
        return null;
    }

    return (
        <div className='dataset-dimension-range-selector dataset-combo-selector'>
            <span>{props.dimension.name}: </span>
            <Select
                mode='multiple'
                options={domain.values.map((domainValue) => {
                    return {
                        value: domainValue.value.toString(),
                        label: domainValue.label || domainValue.value.toString()
                    };
                })}
                value={props.value as string[] | undefined}
                onChange={(value) => props.onChange(value as T[] | undefined)}
                placeholder={`Select some ${props.dimension.name.toLowerCase()} value`}
                allowClear={false}
            />
        </div>
    );
};

export type DatasetDimensionRangeSelectorProps = {
    dimension: DatasetDimension<DimensionDomainType>;
    value?: DimensionRangeType;
    onChange: (value: DimensionRangeType | undefined) => void;
    allowRangeSelection?: boolean;
};

// TODO: This should be updated to support dynamic domains (in a similar way as DatasetDimensionValueSelector)
export const DatasetDimensionRangeSelector = (props: DatasetDimensionRangeSelectorProps) => {
    const domain = useDatasetDomain({
        dimension: props.dimension
    });

    const dimension = {
        ...props.dimension,
        domain: domain
    };

    if (!domain) {
        const { value, onChange } = props;
        if (props.dimension.id === 'time') {
            return (
                <DatasetTimeRangeSelector dimension={dimension as TimeDimension} value={value as DomainRange<Date>} onChange={onChange} />
            );
        } else {
            return (
                <DatasetValueRangeSelector
                    dimension={dimension as ValueDimension}
                    value={value as DomainRange<number>}
                    onChange={onChange}
                />
            );
        }
    }

    if (isValueDomain(domain)) {
        const { value, onChange } = props;
        if (domain.min instanceof Date) {
            return (
                <DatasetTimeRangeSelector dimension={dimension as TimeDimension} value={value as DomainRange<Date>} onChange={onChange} />
            );
        } else {
            return (
                <DatasetValueRangeSelector
                    dimension={dimension as ValueDimension}
                    value={value as DomainRange<number>}
                    onChange={onChange}
                />
            );
        }
    } else {
        const { value, onChange, allowRangeSelection } = props;
        if (allowRangeSelection) {
            return (
                <DatasetCategoricalRangeSelector
                    dimension={dimension as CategoricalDimension<string>}
                    value={value as string[]}
                    onChange={onChange}
                />
            );
        } else {
            return (
                <div className='dataset-dimension-range-selector'>
                    <span>{props.dimension.name}: </span>
                    <div>All values</div>
                </div>
            );
        }
    }
};
