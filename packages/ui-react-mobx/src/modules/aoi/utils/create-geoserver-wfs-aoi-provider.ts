import { createAxiosInstance, DATE_FIELD_ID, DATE_RANGE_FIELD_ID, NUMERIC_FIELD_ID, NUMERIC_RANGE_FIELD_ID, QueryParams, SortOrder } from '@oidajs/core';
import { AoiSourceProvider } from '../models/aoi-source';

export type GeoserverWfsAoiProviderConfig = {
    serviceUrl: string;
    typeName: string;
    geometryProp?: string;
    nameProp?: string;
};

export const createGeoserverWfsAoiProvider = (config: GeoserverWfsAoiProviderConfig) => {

    const axiosInstance = createAxiosInstance();
    const aoiSourceProvider: AoiSourceProvider = (queryParams: QueryParams) => {

        const cqlClauses = queryParams.filters?.map((filter) => {
            if (filter.type === NUMERIC_RANGE_FIELD_ID) {
                return `(${filter.key} BETWEEN ${filter.value.from} AND ${filter.value.to})`;
            } else if (filter.type === NUMERIC_FIELD_ID) {
                return `(${filter.key} = ${filter.value})`;
            } else if (filter.type === DATE_FIELD_ID) {
                return `(${filter.key} = ${filter.value.toISOString()})`;
            } else if (filter.type === DATE_RANGE_FIELD_ID) {
                return `(${filter.key} BETWEEN ${filter.value.start.toISOString()} AND ${filter.value.end.toISOString()})`;
            } else if (filter.key === 'geometryType') {
                const geometryProp = config.geometryProp || 'the_geom';
                const values: string[] = Array.isArray(filter.value) ? filter.value : [filter.value];
                const valueString = values.map((value) => {
                    return `'${value}'`;
                }).join(',');
                return `geometryType(${geometryProp}) IN (${valueString})`;
            } else {
                return `(${filter.key} ILIKE '%${filter.value}%')`;
            }
        });

        const params = {
            service: 'WFS',
            version: '2.0.0',
            request: 'GetFeature',
            typeName: config.typeName,
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            startIndex: queryParams.paging?.offset,
            count: queryParams.paging?.pageSize,
            sortBy: queryParams.sortBy ?
                `${queryParams.sortBy?.key} ${queryParams.sortBy.order === SortOrder.Descending ? 'D' : 'A'}`
                : undefined,
            cql_filter: cqlClauses?.length ? cqlClauses?.join(' AND ') : undefined
        };

        return axiosInstance.cancelableRequest<GeoJSON.FeatureCollection & {totalFeatures: number}>({
            url: config.serviceUrl,
            params: params,
        }).then((response) => {
            return {
                total: response.data.totalFeatures,
                results: response.data.features.map((feature, idx) => {
                    let properties = feature.properties || {};
                    let name = properties[config.nameProp || 'name'] || `${config.typeName}.${idx}`;
                    return {
                        id: feature.id || `feature_${idx}`,
                        name: name,
                        geometry: feature.geometry,
                        properties: properties,
                        color: 'white'
                    };
                })
            };
        });
    };

    return aoiSourceProvider;
};
