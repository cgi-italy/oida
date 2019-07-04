import { QueryParams, SortOrder } from '@oida/core';

let spots = new Array(1000).fill(0).map((item, idx) => {
    return {
        id: `spot${idx}`,
        name: `Spot ${idx}`
    };
});


export const getSpots = (params: QueryParams) => {
    let results = spots.slice();

    let filters = params.filters || [];
    filters.forEach((filter) => {
        if (filter.key === 'name') {
            results = results.filter((item) => {
                return item.name.search(filter.value) !== -1;
            });
        }
    });

    if (params.sortBy) {
        let sortKey = params.sortBy.key;
        results = results.sort((a, b) => {
            return a[sortKey] < b[sortKey] ? -1 : 1;
        });
        if (params.sortBy.order === SortOrder.Descending) {
            results = results.reverse();
        }
    }

    if (params.paging) {
        results = results.slice(params.paging.offset, params.paging.offset + params.paging.pageSize);
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                total: spots.length,
                results: results
            });
        }, 500);
    });
};
