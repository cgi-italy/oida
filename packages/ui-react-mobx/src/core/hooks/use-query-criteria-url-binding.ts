import queryString from 'query-string';
import lzString from 'lz-string';

import { SortOrder, getFormFieldSerializer, QueryFilter } from '@oidajs/core';
import { QueryParams as QueryParamsState } from '@oidajs/state-mobx';

import { useRouteSearchStateBinding } from './use-route-search-state-binding';


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
};

export const serializeQueryFilters = (filters: QueryFilter[]): string => {
    const q: Array<{k: string, v: string, t: string}> = [];

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

    const queryUrlKeys = props.queryKeys || defaultQueryKeys;

    const getUrlFromCriteria = () => {

        const criteria = props.criteria.data;

        let {paging, filters, sortBy} = criteria;

        let urlParams = queryString.parse(window.location.search);

        if (paging) {
            urlParams[queryUrlKeys.page] = paging.page.toString();
            urlParams[queryUrlKeys.pageSize] = paging.pageSize.toString();
        } else {
            delete urlParams[queryUrlKeys.page];
            delete urlParams[queryUrlKeys.pageSize];
        }

        urlParams[queryUrlKeys.sortKey] = sortBy?.key || '';
        urlParams[queryUrlKeys.sortOrder] = sortBy?.order || '';

        if (filters) {
            urlParams[queryUrlKeys.filters] = serializeQueryFilters(filters);
        } else {
            delete urlParams[queryUrlKeys.filters];
        }

        let updatedQueryString = `${queryString.stringify(urlParams)}`;
        return updatedQueryString;
    };

    const updateCriteriaFromUrl = (search) => {
        let urlParams = queryString.parse(search);
        if (urlParams[queryUrlKeys.page] !== undefined) {
            props.criteria.paging.setPage(parseInt(urlParams[queryUrlKeys.page] as string));
        }
        if (urlParams[queryUrlKeys.pageSize] !== undefined) {
            props.criteria.paging.setPageSize(parseInt(urlParams[queryUrlKeys.pageSize] as string));
        }

        const sortKey = urlParams[queryUrlKeys.sortKey] as string;
        if (sortKey !== undefined) {
            props.criteria.sorting.sortBy({
                key: sortKey,
            });
        }

        const sortOrder = urlParams[queryUrlKeys.sortOrder] as string;
        if (sortOrder !== undefined) {
            props.criteria.sorting.sortBy({
                order: sortOrder === 'desc' ? SortOrder.Descending : SortOrder.Ascending
            });
        }

        const urlFilters = urlParams[queryUrlKeys.filters];
        if (urlFilters !== undefined && urlFilters !== serializeQueryFilters(props.criteria.data.filters || [])) {

            props.criteria.filters.clear();
            const filterValues = urlFilters ? JSON.parse(lzString.decompressFromEncodedURIComponent(urlFilters)) : [];

            filterValues.forEach((filter) => {
                let serializer = getFormFieldSerializer(filter.t);
                if (serializer) {
                    let value = serializer.fromJSON(filter.v);
                    if (value) {
                        props.criteria.filters.set(filter.k, value, filter.t);
                    }
                }
            });
        }
    };

    useRouteSearchStateBinding({
        stateQueryStringSelector: getUrlFromCriteria,
        updateState: updateCriteriaFromUrl
    });

};
