import { makeObservable, observable, action, computed, reaction, ObservableMap } from 'mobx';

import { SortOrder, QueryFilter } from '@oida/core';

export type DataFiltersProps = {
    values?: Record<string, QueryFilter>
};

export class DataFilters {
    items: ObservableMap<string, QueryFilter>;

    constructor(props?: DataFiltersProps) {

        this.items =  observable.map(props?.values || {}, {
            deep: false
        });

        makeObservable(this, {
            set: action,
            clear: action,
            unset: action
        });
    }

    get(key: string) {
        return this.items.get(key);
    }

    set(key: string, value: any, type: string) {
        this.items.set(key, {
            key: key,
            value: value,
            type: type
        });
    }

    clear() {
        this.items.clear();
    }

    unset(key: string) {
        this.items.delete(key);
    }

    asArray() {
        return Array.from(this.items.values());
    }
}

export type DataSortingProps = {
    key: string,
    order?: SortOrder
};

export class DataSorting {
    key: string | undefined;
    order: SortOrder;

    constructor(props?: DataSortingProps) {

        this.key = props?.key;
        this.order = props?.order || SortOrder.Ascending;

        makeObservable(this, {
            key: observable,
            order: observable,
            sortBy: action,
            clear: action
        });
    }

    sortBy(params: {key?: string, order?: SortOrder}) {
        if (params.key) {
            this.key = params.key;
        }
        if (params.order) {
            this.order = params.order;
        }
    }

    clear() {
        this.key = undefined;
    }
}

export type DataPagingProps = {
    page?: number;
    pageSize?: number;
    total?: number;
};

export class DataPaging {
    page: number;
    pageSize: number;
    total: number;

    constructor(props?: DataPagingProps) {

        this.page = props?.page || 0;
        this.pageSize = props?.pageSize || 20;
        this.total = props?.total || 0;

        makeObservable(this, {
            page: observable,
            pageSize: observable,
            total: observable,
            offset: computed,
            numPages: computed,
            isFirstPage: computed,
            isLastPage: computed,
            setPage: action,
            setPageSize: action,
            setTotal: action,
            reset: action
        });
    }

    get offset() {
        return this.pageSize * this.page;
    }

    get numPages() {
        return Math.ceil(this.total / this.pageSize);
    }

    get isFirstPage() {
        return this.page === 0;
    }

    get isLastPage() {
        return this.page === this.numPages - 1;
    }

    setPage(page: number) {
        this.page = page;
    }

    setPageSize(pageSize: number) {
        this.pageSize = pageSize;
    }

    setTotal(total: number) {
        this.total = total;
    }

    reset() {
        this.page = 0;
    }
}


export type QueryParamsProps = {
    filters?: DataFilters | DataFiltersProps,
    paging?: DataPaging | DataPagingProps,
    sorting?: DataSorting | DataSortingProps,
};

export class QueryParams {
    filters: DataFilters;
    paging: DataPaging;
    sorting: DataSorting;

    constructor(props?: QueryParamsProps) {
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

        makeObservable(this, {
            data: computed
        });

        this.afterInit_();
    }

    get data() {
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

    protected afterInit_() {
        reaction(() => Object.values(this.filters.items), () => {
            this.paging.setPage(0);
        });
    }
}