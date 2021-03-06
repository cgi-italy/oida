import lzString from 'lz-string';

import { SortOrder, getFormFieldSerializer, QueryFilter } from '@oidajs/core';
import { QueryParams as QueryParamsState } from '@oidajs/state-mobx';

import { useRouteSearchStateBinding } from './use-route-search-state-binding';
import { useCallback, useMemo } from 'react';

const defaultQueryKeys = {
    page: 'page',
    pageSize: 'pageSize',
    sortKey: 'sortKey',
    sortOrder: 'sortOrder',
    filters: 'q'
};

export type QueryUrlKeys = typeof defaultQueryKeys;

export type QueryCriteriaUrlBindingProps = {
    criteria: QueryParamsState;
    queryKeys?: QueryUrlKeys;
    queryKeyPrefix?: string;
};

export const serializeQueryFilters = (filters: QueryFilter[]): string => {
    const q: Array<{ k: string; v: string; t: string }> = [];

    filters.forEach((filter) => {
        const serializer = getFormFieldSerializer(filter.type);
        if (serializer) {
            q.push({
                k: filter.key,
                v: serializer.toJSON(filter.value),
                t: filter.type
            });
        }
    });

    return lzString.compressToEncodedURIComponent(JSON.stringify(q));
};

export const useQueryCriteriaUrlBinding = (props: QueryCriteriaUrlBindingProps) => {
    const queryUrlKeys = useMemo(() => {
        if (props.queryKeys) {
            return props.queryKeys;
        } else if (props.queryKeyPrefix) {
            return {
                page: `${props.queryKeyPrefix}_${defaultQueryKeys.page}`,
                pageSize: `${props.queryKeyPrefix}_${defaultQueryKeys.pageSize}`,
                sortKey: `${props.queryKeyPrefix}_${defaultQueryKeys.sortKey}`,
                sortOrder: `${props.queryKeyPrefix}_${defaultQueryKeys.sortOrder}`,
                filters: `${props.queryKeyPrefix}_${defaultQueryKeys.filters}`
            };
        } else {
            return defaultQueryKeys;
        }
    }, [props.queryKeys, props.queryKeyPrefix]);

    const getUrlParamsFromCriteria = useCallback(() => {
        const { paging, filters, sortBy } = props.criteria.data;

        const urlParams = new URLSearchParams();

        if (paging) {
            urlParams.set(queryUrlKeys.page, paging.page.toString());
            urlParams.set(queryUrlKeys.pageSize, paging.pageSize.toString());
        }

        if (sortBy) {
            urlParams.set(queryUrlKeys.sortKey, sortBy.key);
            urlParams.set(queryUrlKeys.sortOrder, sortBy.order);
        } else {
            urlParams.set(queryUrlKeys.sortKey, '');
        }

        if (filters) {
            urlParams.set(queryUrlKeys.filters, serializeQueryFilters(filters));
        }

        return urlParams;
    }, [props.criteria]);

    const updateCriteriaFromUrlParams = useCallback(
        (searchParams: URLSearchParams) => {
            const page = searchParams.get(queryUrlKeys.page);
            if (page) {
                // HACK: we defer the page update, otherwise it will be reset
                // when filters are set
                // TODO: to be solved in the QueryParams state
                setTimeout(() => {
                    props.criteria.paging.setPage(parseInt(page));
                }, 0);
            } else {
                props.criteria.paging.reset();
            }
            const pageSize = searchParams.get(queryUrlKeys.pageSize);
            if (pageSize) {
                props.criteria.paging.setPageSize(parseInt(pageSize));
            }

            const sortKey = searchParams.get(queryUrlKeys.sortKey);
            if (sortKey) {
                props.criteria.sorting.sortBy({
                    key: sortKey
                });
            } else {
                props.criteria.sorting.clear();
            }
            const sortOrder = searchParams.get(queryUrlKeys.sortOrder);
            props.criteria.sorting.sortBy({
                order: sortOrder === 'desc' ? SortOrder.Descending : SortOrder.Ascending
            });

            const queryFilters = searchParams.get(queryUrlKeys.filters);
            if (queryFilters) {
                props.criteria.filters.clear();
                const filterValues = JSON.parse(lzString.decompressFromEncodedURIComponent(queryFilters));
                filterValues.forEach((filter) => {
                    const serializer = getFormFieldSerializer(filter.t);
                    if (serializer) {
                        const value = serializer.fromJSON(filter.v);
                        if (value) {
                            props.criteria.filters.set(filter.k, value, filter.t);
                        }
                    }
                });
            } else {
                props.criteria.filters.clear();
            }
        },
        [props.criteria]
    );

    useRouteSearchStateBinding({
        searchParamsStateSelector: getUrlParamsFromCriteria,
        updateStateFromSearchParams: updateCriteriaFromUrlParams
    });
};
