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

export const isValueDomain = <T, S>(domain: DataDomain<T, S>): domain is ValueDomain<T, S> => {
    return !Array.isArray(domain);
};

export type DataDomainProvider<T, S = T> = (filters?: QueryFilter[]) => Promise<DataDomain<T, S>>;

export type DatasetVariable<T, S = T> = {
    id: string,
    name: string,
    domain?: DataDomain<T, S>,
    domainProvider?: DataDomainProvider<T, S>,
    units?: string,
    description?: string
};

export type DatasetDimension<T, S = T> = DatasetVariable<T, S>;
