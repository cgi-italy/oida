import { makeObservable, observable, action, computed, reaction, ObservableMap } from 'mobx';

import { SortOrder, QueryFilter, QueryParams as QueryCriteria } from '@oidajs/core';


export type FilterTypeReaction =  (filters: DataFilters, key: string) => (() => void);

const filterTypeReactions: Record<string, FilterTypeReaction> = {};

export const setReactionForFilterType = (type: string, reaction: FilterTypeReaction) => {
    filterTypeReactions[type] = reaction;
};

/** {@Link DataFilters} props */
export type DataFiltersProps<FILTER extends QueryFilter = any> = {
    /** The initial filter values */
    values?: Record<string, FILTER>
};


type FindByKey<Union, Key> = Union extends { key: Key } ? Union : never;

/**
 * A class to manage the state of a set of form fields or filters
 *
 * ```
 * // 1. A weakly typed example
 * const filterValues = new DataFilters();
 * autorun(() => console.log(filterValues.asArray())) // will be called every time a filter value is updated
 * filterValues.set('fieldname', 33, 'number');
 *
 *
 * // 2. A strongly typed example
 * const filterValues = new DataFilters<QueryFilter<'time', 'daterange'> | QueryFilter<'q', 'string'>>();

 * filterValues.set('q', 'test', 'string'); // OK
 *
 * filterValues.set('otherKey', 'test', 'string'); // Type error: Argument of type '"otherKey"' \
 * // is not assignable to parameter of type '"time" | "q"'
 *
 * filterValues.set('time', 666, 'daterange'); // Type error: Argument of type 'number'
 * // is not assignable to parameter of type 'DateRangeValue'
 *
 * filterValues.set('q', 'sss', 'daterange'); // Type error: Argument of type '"daterange"'
 * // is not assignable to parameter of type '"string"'
 * ```
 *
 * @template FILTERS used to define the allowed filter types
 */
export class DataFilters<FILTERS extends QueryFilter = any> {
    items: ObservableMap<string, FILTERS>;

    protected reactionsDisposer_: Record<string, () => void>;

    constructor(props?: DataFiltersProps<FILTERS>) {

        this.items =  observable.map(props?.values || {}, {
            deep: false
        });

        this.reactionsDisposer_ = {};

        makeObservable(this);
    }

    /**
     * Get the value of a specific filter
     * @param key The filter key
     * @returns the filter value if defined
     */
    get<KEY extends FILTERS['key']>(key: KEY): FindByKey<FILTERS, KEY> | undefined {
        return this.items.get(key) as FindByKey<FILTERS, KEY> | undefined;
    }

    @action
    set<KEY extends FILTERS['key']>(key: KEY, value: FindByKey<FILTERS, KEY>['value'], type: FindByKey<FILTERS, KEY>['type']) {
        this.items.set(key, {
            key,
            value,
            type
        } as unknown as FILTERS);
        if (filterTypeReactions[type] && !this.reactionsDisposer_[key]) {
            this.reactionsDisposer_[key] = filterTypeReactions[type](this, key);
        }
    }

    @action
    clear() {
        this.items.clear();
        Object.values(this.reactionsDisposer_).forEach(disposer => disposer());
        this.reactionsDisposer_ = {};
    }

    @action
    unset(key: string) {
        this.items.delete(key);
        if (this.reactionsDisposer_[key]) {
            this.reactionsDisposer_[key]();
            delete this.reactionsDisposer_[key];
        }
    }

    asArray() {
        return Array.from(this.items.values());
    }
}

/** {@Linki DataSorting} props */
export type DataSortingProps = {
    key: string,
    order?: SortOrder
};

/** A class to manage the sorting state of a collection */
export class DataSorting {
    @observable key: string | undefined;
    @observable order: SortOrder;

    constructor(props?: DataSortingProps) {

        this.key = props?.key;
        this.order = props?.order || SortOrder.Ascending;

        makeObservable(this);
    }

    @action
    sortBy(params: {key?: string, order?: SortOrder}) {
        if (params.key) {
            this.key = params.key;
        }
        if (params.order) {
            this.order = params.order;
        }
    }

    @action
    clear() {
        this.key = undefined;
    }
}

/** {@Link DataPaging} props */
export type DataPagingProps = {
    page?: number;
    pageSize?: number;
    total?: number;
};

/** A class to manage a data pager state */
export class DataPaging {
    /** The current page number */
    @observable page: number;
    /** The page size  */
    @observable pageSize: number;
    /** The total number of records */
    @observable total: number;

    constructor(props?: DataPagingProps) {

        this.page = props?.page || 0;
        this.pageSize = props?.pageSize || 20;
        this.total = props?.total || 0;

        makeObservable(this);
    }

    /** The current start index */
    @computed
    get offset() {
        return this.pageSize * this.page;
    }

    /** Total number of pages */
    @computed
    get numPages() {
        return Math.ceil(this.total / this.pageSize);
    }

    @computed
    get isFirstPage() {
        return this.page === 0;
    }

    @computed
    get isLastPage() {
        return this.page === this.numPages - 1;
    }

    /**
     * Set the page number
     *
     * @param page Page number
     */
    @action
    setPage(page: number) {
        this.page = page;
    }

    /**
     * Set the paging size
     *
     * @param pageSize Page size
     */
    @action
    setPageSize(pageSize: number) {
        this.pageSize = pageSize;
    }

    /**
     * Set the total number of records
     *
     * @param total Sumber of records
     */
    @action
    setTotal(total: number) {
        this.total = total;
    }

    /**
     * Reset the page number
     */
    @action
    reset() {
        this.page = 0;
    }
}

/** {@Link QueryParam} props */
export type QueryParamsProps<FILTERS extends QueryFilter = any> = {
    filters?: DataFilters<FILTERS> | DataFiltersProps<FILTERS>,
    paging?: DataPaging | DataPagingProps,
    sorting?: DataSorting | DataSortingProps,
};

/**
 * A class to manage a collection query state.
 * It combines {@Link DataFilters}, {@Link DataPaging} and {@Link DataSorting}
 */
export class QueryParams<FILTERS extends QueryFilter = any> {
    filters: DataFilters<FILTERS>;
    paging: DataPaging;
    sorting: DataSorting;

    constructor(props?: QueryParamsProps<FILTERS>) {
        if (props?.filters instanceof DataFilters) {
            this.filters = props.filters;
        } else {
            this.filters = new DataFilters(props?.filters);
        }
        if (props?.paging instanceof DataPaging) {
            this.paging = props.paging;
        } else {
            this.paging = new DataPaging(props?.paging);
        }

        if (props?.sorting instanceof DataSorting) {
            this.sorting = props.sorting;
        } else {
            this.sorting = new DataSorting(props?.sorting);
        }

        makeObservable(this);

        this.afterInit_();
    }

    /** The current query criteria */
    @computed
    get data(): QueryCriteria<FILTERS> {
        return {
            paging: {
                page: this.paging.page,
                pageSize: this.paging.pageSize,
                offset: this.paging.offset
            },
            filters: this.filters.asArray(),
            sortBy: this.sorting.key ? {
                key: this.sorting.key,
                order: this.sorting.order
            } : undefined
        };
    }

    /** Reset the query state */
    @action
    reset() {
        this.filters.clear();
        this.paging.setTotal(0);
    }

    protected afterInit_() {
        reaction(() => this.filters.asArray(), () => {
            this.paging.setPage(0);
        });
    }
}
