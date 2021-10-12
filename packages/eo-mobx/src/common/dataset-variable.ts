import { AoiValue, DateRangeValue } from '@oida/core';

export type DomainRange<T> = {
    min: T,
    max: T
};

export type CategoricalDomain<T> = {
    values: Array<{
        value: T,
        label?: string
    }>
};

export type ValueDomain<T, S = T> = Partial<DomainRange<T>> & {
    step?: S,
    noData?: T
};

export type DataDomain<T, S = T> = ValueDomain<T, S> | CategoricalDomain<T>;

export const isValueDomain = <T, S, C>(domain: ValueDomain<T, S> | CategoricalDomain<C>): domain is ValueDomain<T, S> => {
    return !Array.isArray((domain as  CategoricalDomain<C>).values);
};

export type DataDomainProviderFilters = {
    aoi?: AoiValue;
    toi?: Date | DateRangeValue;
    variable?: string;
    dimensionValues?: Map<string, any>
};

export type DataDomainProvider<D extends DataDomain<unknown>> = (filters?: DataDomainProviderFilters) => Promise<D>;

export const isDomainProvider = <D extends DataDomain<unknown>>(domain: D | DataDomainProvider<D>): domain is DataDomainProvider<D> => {
    return (typeof(domain) === 'function');
};

export type DatasetVariable<D extends DataDomain<unknown>> = {
    id: string,
    name: string,
    domain?: D | DataDomainProvider<D>,
    units?: string,
    description?: string
};

export type DatasetDimension<D extends DataDomain<unknown>> = DatasetVariable<D>;

export type NumericalValueDomain = ValueDomain<number> & {
    scale?: number;
    offset?: number;
    reservedValues?: Record<number, string>;
};

export type NumericDomain = NumericalValueDomain | CategoricalDomain<number>;

export type NumericVariable = DatasetVariable<NumericDomain>;
