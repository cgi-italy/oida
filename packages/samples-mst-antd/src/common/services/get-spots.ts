import { QueryParams, SortOrder } from '@oida/core';
import faker from 'faker';
import pointInPolygon from '@turf/boolean-point-in-polygon';


let spotTypes = ['MUSIC', 'FOOD', 'DRINK'];

let spots = new Array(1000).fill(0).map((item, idx) => {
    return {
        id: faker.random.uuid(),
        name: faker.company.catchPhraseNoun(),
        type: faker.random.arrayElement(spotTypes),
        location: {
            lat: parseFloat(faker.address.latitude()),
            lon: parseFloat(faker.address.longitude())
        }
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
        } else if (filter.key === 'type') {
            results = results.filter((item) => {
                return item.type === filter.value;
            });
        } else if (filter.key === 'aoi') {
            let aoi = filter.value;
            results = results.filter((item) => {
                let location = [item.location.lon, item.location.lat];
                return pointInPolygon(location, {
                    type: 'Polygon',
                    coordinates: aoi.coordinates
                });
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

    let total = results.length;
    if (params.paging) {
        results = results.slice(params.paging.offset, params.paging.offset + params.paging.pageSize);
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                total: total,
                results: results
            });
        }, faker.random.number({min: 100, max: 1000}));
    });
};
