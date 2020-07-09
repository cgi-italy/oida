import { QueryParams, SortOrder } from '@oida/core';

import { AoiSourceProvider, AoiSourceItem } from '../types';

const filterMemoryAoiSource = (data: AoiSourceItem[], queryParams: QueryParams) => {

    let outputData: AoiSourceItem[] = data;

    if (queryParams.filters) {
        queryParams.filters.forEach((filter) => {
            outputData = outputData.filter((aoi) => {
                if (filter.key === 'name') {
                    let match = aoi.name.toLowerCase().search(filter.value.toLowerCase());
                    return (match !== -1);
                } else if (filter.key === 'geometryType') {
                    return filter.value.includes(aoi.geometry.type);
                } else {
                    if (aoi.properties && aoi.properties[filter.key]) {
                        let match = String(aoi.properties[filter.key])
                        .toLowerCase()
                        .search(filter.value.toLowerCase());
                        return (match !== -1);
                    } else {
                        return true;
                    }
                }
            });
        });
    }

    let total = outputData.length;

    if (queryParams.sortBy) {
        let key = queryParams.sortBy.key;
        outputData = outputData.sort((i1, i2) => {
            if (key === 'name') {
                return i1.name < i2.name ? -1 : 1;
            }
            if (!i1.properties || !i1.properties[key]) {
                return -1;
            }
            if (!i2.properties || !i2.properties[key]) {
                return 1;
            }
            return i1.properties[key] < i2.properties[key] ? -1 : 1;
        });

        if (queryParams.sortBy.order === SortOrder.Descending) {
            outputData = outputData.reverse();
        }
    }
    if (queryParams.paging) {
        outputData = outputData.slice(queryParams.paging.offset, queryParams.paging.offset + queryParams.paging.pageSize);
    }

    return {
        total: total,
        results: outputData
    };
};

export const createInMemoryAoiProvider = (aoiList: AoiSourceItem[]) => {

    return ((queryParams: QueryParams) => {
        return Promise.resolve(filterMemoryAoiSource(aoiList, queryParams));
    }) as AoiSourceProvider;
};
