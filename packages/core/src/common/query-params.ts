import { SortOrder } from './sort-order';
import { IFormFieldType, IFormFieldValueType } from '../form/form-field';

/**
 * Query filter type
 * @template K the query filter key literal
 * @template T the query filter type literal
 */
export type QueryFilter<K extends string = string, T extends IFormFieldType = any> = {
    /** The query filter key */
    key: K;
    /** The query filter value */
    value: IFormFieldValueType<T>;
    /** The query filter type */
    type: T;
};

/**
 * Query parameters
 * @template FILTERS filter types. Specify this to restrict the set of allowed query filters
 *
 * ```
 * let queryParams: QueryParams<QueryFilter<'q', 'string'> | QueryFilter<'start', 'date'>>;
 * ```
 */
export type QueryParams<FILTERS extends QueryFilter = QueryFilter> = {
    paging?: { page: number; pageSize: number; offset: number };
    filters?: Array<FILTERS>;
    sortBy?: { key: string; order: SortOrder };
};
