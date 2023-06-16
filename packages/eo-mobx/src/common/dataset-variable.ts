import { AoiValue, DateRangeValue, QueryFilter } from '@oidajs/core';

export type DomainRange<T> = {
    min: T;
    max: T;
};

export type ValueDomain<TYPE, STEP = TYPE> = Partial<DomainRange<TYPE>> & {
    step?: STEP;
    noData?: TYPE;
};

export type CategoricalDomain<T> = {
    values: Array<{
        value: T;
        label?: string;
    }>;
};

export type DataDomain<VALUE_TYPE, CATEGORY_TYPE = VALUE_TYPE, VALUE_STEP = VALUE_TYPE> =
    | ValueDomain<VALUE_TYPE, VALUE_STEP>
    | CategoricalDomain<CATEGORY_TYPE>;

export const isValueDomain = (domain: ValueDomain<unknown> | CategoricalDomain<unknown>): domain is ValueDomain<unknown> => {
    return !Array.isArray((domain as CategoricalDomain<unknown>).values);
};

export type DataDomainProviderFilters = {
    aoi?: AoiValue;
    toi?: Date | DateRangeValue;
    variable?: string;
    dimensionValues?: Map<string, any>;
    additionaFilters?: Map<string, QueryFilter>;
};

export type DataDomainProvider<D extends DataDomain<unknown>> = (filters?: DataDomainProviderFilters) => Promise<D>;

export const isDomainProvider = <D extends DataDomain<unknown>>(domain: D | DataDomainProvider<D>): domain is DataDomainProvider<D> => {
    return typeof domain === 'function';
};

export type DatasetVariable<D extends DataDomain<unknown>> = {
    id: string;
    name: string;
    domain?: D | DataDomainProvider<D>;
    units?: string;
    description?: string;
};

export type DatasetDimension<D extends DataDomain<unknown>> = DatasetVariable<D>;

export type DistributionHistogramBin = [x_center: number, count: number, x_min: number, x_max: number, label?: string];
export type DistributionPercentile = [percentile: number, value: number];

export type NumericalValueDomain = ValueDomain<number> & {
    scale?: number;
    offset?: number;
    reservedValues?: Record<number, string>;
    percentiles?: DistributionPercentile[];
    histogram?: DistributionHistogramBin[];
};

export type NumericDomain = NumericalValueDomain | CategoricalDomain<number>;

export type NumericVariable = DatasetVariable<NumericDomain>;
