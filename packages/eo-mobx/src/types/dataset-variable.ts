import { QueryFilter } from '@oida/core';

export type DomainRange<T> = {
    min: T,
    max: T
};

export type CategoricalDomain<T> = Array<{
    value: T,
    label?: string
}>;

export type ValueDomain<T, S = T> = DomainRange<T> & {
    step?: S,
    noData?: T
};

export type DataDomain<T, S = T> = ValueDomain<T, S> | CategoricalDomain<T>;

export const isValueDomain = <T, S, C>(domain: ValueDomain<T, S> | CategoricalDomain<C>): domain is ValueDomain<T, S> => {
    return !Array.isArray(domain);
};

export type DataDomainProvider<D extends DataDomain<unknown>> = (filters?: QueryFilter[]) => Promise<D>;

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

export type NumericVariable = DatasetVariable<ValueDomain<number>>;
