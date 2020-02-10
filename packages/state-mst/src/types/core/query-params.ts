import { types, Instance, addDisposer, onSnapshot } from 'mobx-state-tree';

import { SortOrder } from '@oida/core';

import { enumFromType } from '../mst';

const DataFilterDecl = types.model('DataFilter', {
    key: types.identifier,
    value: types.frozen(),
    type: types.string
});

type DataFilterType = typeof DataFilterDecl;
export interface DataFilterInterface extends DataFilterType {}
export const DataFilter: DataFilterInterface = DataFilterDecl;
export interface IDataFilter extends Instance<DataFilterInterface> {}

const DataFiltersDecl = types.model('DataFilters', {
    items: types.map(DataFilter)
}).actions((self) => {
    return {
        set: (key: string, value: any, type: string) => {
            self.items.put(DataFilter.create({
                key,
                value,
                type
            }));
        },
        unset: (key) => {
            self.items.delete(key);
        },
        clear: () => {
            self.items.clear();
        }
    };
}).views((self) => {
    return {
        get: (key: string) => {
            let item = self.items.get(key);
            return item ? item.value : undefined;
        }
    };
});

type DataFiltersType = typeof DataFiltersDecl;
export interface DataFiltersInterface extends DataFiltersType {}
export const DataFilters: DataFiltersInterface = DataFiltersDecl;
export interface IDataFilters extends Instance<DataFiltersInterface> {}


const DataSortingDecl = types.model('DataSorting', {
    key: types.maybe(types.string),
    order: types.optional(enumFromType<SortOrder>(SortOrder), SortOrder.Ascending)
}).actions((self) => {
    return {
        sortBy: (params: {key?: string, order?: SortOrder}) => {
            if (params.key) {
                self.key = params.key;
            }
            if (params.order) {
                self.order = params.order;
            }
        },
        clear: () => {
            self.key = undefined;
        }
    };
});

type DataSortingType = typeof DataSortingDecl;
export interface DataSortingInterface extends DataSortingType {}
export const DataSorting: DataSortingInterface = DataSortingDecl;
export interface IDataSorting extends Instance<DataSortingInterface> {}


const DataPagingDecl = types.model('DataPaging', {
    page: types.optional(types.integer, 0),
    pageSize: types.optional(types.integer, 20),
    total: types.optional(types.integer, 0)
}).views((self: any) => {
    return {
        get offset() {
            return self.pageSize * self.page;
        },
        get numPages() {
            return (self.total !== undefined) ? Math.ceil(self.total / self.pageSize) : -1;
        },
        isFirstPage: () => {
            return self.page === 0;
        },
        isLastPage: () => {
            return self.page === (self.numPages - 1);
        }
    };
}).actions((self) => {
    return {
        setPage: (page: number) => {
            self.page = page;
        },
        setPageSize: (pageSize: number) => {
            self.pageSize = pageSize;
        },
        setTotal: (total: number) => {
            self.total = total;
        },
        reset: () => {
            self.page = 0;
        }
    };
});

type DataPagingType = typeof DataPagingDecl;
export interface DataPagingInterface extends DataPagingType {}
export const DataPaging: DataPagingInterface = DataPagingDecl;
export interface IDataPaging extends Instance<DataPagingInterface> {}


const QueryParamsDecl = types.model('QueryParams', {
    filters: types.optional(DataFilters, {}),
    paging: types.optional(DataPaging, {}),
    sorting: types.optional(DataSorting, {})
}).views((self) => {
    return {
        get data() {
            return {
                paging: {
                    page: self.paging.page,
                    pageSize: self.paging.pageSize,
                    offset: self.paging.offset
                },
                filters: Array.from(self.filters.items, item => ({key: item[0], value: item[1].value, type: item[1].type})),
                sortBy: self.sorting.key ? {
                    key: self.sorting.key,
                    order: self.sorting.order
                } : undefined
            };
        }
    };
}).actions((self) => {
    return {
        afterCreate: () => {
            const resetPageDisposer = onSnapshot(self.filters, () => {
                self.paging.reset();
            });

            addDisposer(self, resetPageDisposer);
        }
    };
});

type QueryParamsType = typeof QueryParamsDecl;
export interface QueryParamsInterface extends QueryParamsType {}
export const QueryParams: QueryParamsInterface = QueryParamsDecl;
export interface IQueryParams extends Instance<QueryParamsInterface> {}
