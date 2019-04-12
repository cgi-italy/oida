import { types, Instance, addDisposer, onSnapshot } from 'mobx-state-tree';

import { SortOrder } from '@oida/core';

import { enumFromType } from '../mst';

export const DataFilter = types.model('DataFilter', {
    key: types.identifier,
    value: types.frozen()
});

export const DataFilters = types.model('DataFilters', {
    items: types.map(DataFilter)
}).actions((self) => {
    return {
        set: (key: string, value: any) => {
            self.items.put(DataFilter.create({
                key,
                value
            }));
        },
        unset: (key) => {
            self.items.delete(key);
        },
        clear: () => {
            self.items.clear();
        }
    };
});

export type IDataFilters = Instance<typeof DataFilters>;

export const DataSorting = types.model('DataSorting', {
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

export type IDataSorting = Instance<typeof DataSorting>;

export const DataPaging = types.model('DataPaging', {
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

export type IDataPaging = Instance<typeof DataPaging>;


export const QueryParams = types.model('QueryParams', {
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
                filters: Array.from(self.filters.items, item => ({key: item[0], value: item[1].value})),
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

export type IQueryParams = Instance<typeof QueryParams>;
