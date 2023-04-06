import moment from 'moment';
import bboxPolygon from '@turf/bbox-polygon';
import rewind from '@turf/rewind';

import {
    AOI_FIELD_ID,
    AxiosInstanceWithCancellation,
    BOOLEAN_FIELD_ID,
    capitalizeString,
    createAxiosInstance,
    DATE_FIELD_ID,
    DATE_RANGE_FIELD_ID,
    ENUM_FIELD_ID,
    IFormFieldType,
    isQueryFilterOfType,
    QueryFilter,
    QueryParams,
    SortOrder,
    STRING_FIELD_ID
} from '@oidajs/core';

export type AdamOpensearchDatasetSubdatasetV2 = {
    minValue: [number];
    maxValue: [number];
    noDataValue: number;
    minDate: string;
    maxDate: string;
    numberOfRecords: number;
    units: string;
    unitsDescription: string;
    Resolution: [number];
};

export type AdamOpensearchDatasetProfileBaseV2<S extends string> = {
    profileSchema: S;
};

export type AdamOpensearchDatasetEOProfileV2 = AdamOpensearchDatasetProfileBaseV2<'eo_profile_schema.json'> & {
    mission?: string;
    processingLevel?: string;
    productType?: string;
    sensor?: string;
};

export type AdamOpensearchDatasetProfileV2 = AdamOpensearchDatasetEOProfileV2;

export type AdamOpensearchDatasetServiceRefV2 = 'discovery-service' | 'access-service';

export type AdamOpensearchDatasetServiceV2 = {
    href: string;
    ref: AdamOpensearchDatasetServiceRefV2;
    title: string;
    type: string;
};

export type AdamOpensearchDatasetLicenseV2 = {
    dataProviderName: string;
    dataProviderUrl: string;
    documentationURL: string;
};

export type AdamOpensearchDatasetMetadataV2 = {
    _id: {
        $oid: string;
    };
    datasetId: string;
    title: string;
    description: string;
    geometry: GeoJSON.Geometry;
    minDate: string;
    maxDate: string;
    numberOfRecords: number;
    services: AdamOpensearchDatasetServiceV2[] | null;
    profile: AdamOpensearchDatasetProfileV2;
    license: AdamOpensearchDatasetLicenseV2;
    temporalResolution: string;
    subDatasets: Record<string, AdamOpensearchDatasetSubdatasetV2>;
};

export type AdamOpensearchProductSubdatasetV2 = {
    band: string;
    dataType: string;
    minValue: number;
    maxValue: number;
    noDataValue: number;
    productPath: string;
    wcsPath: string;
};

export type AdamOpensearchProductMetadataV2 = {
    _id: {
        $oid: string;
    };
    productId: string;
    productType: string;
    geometry: GeoJSON.Geometry;
    productDate: string;
    swath: string;
    orbitNumber: number;
    orbitDirection: 'ASCENDING' | 'DESCENDING';
    cloudCover: number;
    snowCover: number;
    source: string;
    status: string;
    quicklook: string | null;
    thumbnail: string;
    downloadLink: string;
    subDatasets: Record<string, AdamOpensearchProductSubdatasetV2>;
};

export type AdamOpensearchRequestV2 = {
    maxRecords?: number;
    startIndex?: number;
    order?: string;
    sortOrder?: 'ASC' | 'DESC';
} & Record<string, string | string[] | number | number[]>;

export type AdamOpensearchDatasetDiscoveryResponseV2 = {
    type: 'FeatureCollection';
    properties: {
        totalResults: number;
        startIndex: number;
        itemPerPage: number;
    };
    features: AdamOpensearchDatasetMetadataV2[];
};

export type AdamOpensearchProductSearchResponseV2 = {
    type: 'FeatureCollection';
    properties: {
        totalResults: number;
        startIndex: number;
        itemPerPage: number;
    };
    features: AdamOpensearchProductMetadataV2[];
};

export type AdamOpenSearchClientConfigV2 = {
    serviceUrl: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class AdamOpenSearchClientV2 {
    protected static searchParamsSerializer_ = (params: Record<string, any>) => {
        // axios by default encode spaces in params with '+' char
        // adam opensearch endpoint doesn't support this encoding so
        // we override the default serializer here
        const urlParams: string[] = [];
        for (const key in params) {
            if (Array.isArray(params[key])) {
                params[key].forEach((param) => {
                    urlParams.push(`${key}=${param}`);
                });
            } else {
                if (params[key] !== undefined) {
                    urlParams.push(`${key}=${params[key]}`);
                }
            }
        }
        return urlParams.join('&');
    };

    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected serviceUrl_: string;

    constructor(config: AdamOpenSearchClientConfigV2) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.serviceUrl_ = config.serviceUrl;
    }

    getDatasets(queryParams: QueryParams<QueryFilter<string, IFormFieldType>>) {
        const params = this.getSearchParams_(queryParams);

        return this.axiosInstance_
            .request<AdamOpensearchDatasetDiscoveryResponseV2>({
                url: `${this.serviceUrl_}/datasets`,
                params: params,
                paramsSerializer: {
                    serialize: AdamOpenSearchClientV2.searchParamsSerializer_
                }
            })
            .then((response) => {
                return response.data;
            });
    }

    searchProducts(queryParams: QueryParams) {
        const { datasetId, ...params } = this.getSearchParams_(queryParams);

        return this.axiosInstance_
            .request<AdamOpensearchProductSearchResponseV2>({
                url: `${this.serviceUrl_}/search/${datasetId}`,
                params: params,
                paramsSerializer: {
                    serialize: AdamOpenSearchClientV2.searchParamsSerializer_
                }
            })
            .then((response) => {
                return response.data;
            });
    }

    getProductSearchUrls(queryParams: QueryParams<QueryFilter<string, IFormFieldType>>) {
        return this.searchProducts({
            ...queryParams,
            paging: {
                offset: 0,
                pageSize: 1,
                page: 0
            }
        }).then((response) => {
            const total = response.properties.totalResults;
            const pageSize = 100;
            const numPages = total ? Math.ceil(total / pageSize) : 1;
            const searchUrls: string[] = [];

            for (let page = 0; page < numPages; ++page) {
                const searchParams = this.getSearchParams_({
                    ...queryParams,
                    paging: {
                        offset: 0 + pageSize * page,
                        pageSize: pageSize,
                        page: page
                    }
                });
                searchUrls.push(`${this.serviceUrl_}/search?${AdamOpenSearchClientV2.searchParamsSerializer_(searchParams)}`);
            }
            return searchUrls;
        });
    }

    protected getSearchParams_(queryParams: QueryParams<QueryFilter<string, IFormFieldType>>) {
        const params: AdamOpensearchRequestV2 = {};

        if (queryParams.paging) {
            params.maxRecords = queryParams.paging.pageSize;
            params.startIndex = queryParams.paging.offset;
        }
        if (queryParams.sortBy) {
            params.order = queryParams.sortBy.key;
            params.sortOrder = queryParams.sortBy.order === SortOrder.Descending ? 'DESC' : 'ASC';
        }

        if (queryParams.filters) {
            queryParams.filters.forEach((filter) => {
                if (isQueryFilterOfType(filter, STRING_FIELD_ID) || isQueryFilterOfType(filter, ENUM_FIELD_ID)) {
                    params[filter.key] = filter.value;
                } else if (isQueryFilterOfType(filter, BOOLEAN_FIELD_ID)) {
                    params[filter.key] = filter.value ? 'true' : 'false';
                } else if (isQueryFilterOfType(filter, AOI_FIELD_ID)) {
                    const geometry = filter.value.geometry;
                    let polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined;
                    if (geometry.type === 'BBox') {
                        polygon = bboxPolygon(geometry.bbox).geometry;
                    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                        polygon = rewind(geometry);
                    }
                    if (polygon) {
                        params[filter.key] = JSON.stringify(polygon);
                    }
                } else if (isQueryFilterOfType(filter, DATE_FIELD_ID)) {
                    params[filter.key] = moment.utc(filter.value).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
                } else if (isQueryFilterOfType(filter, DATE_RANGE_FIELD_ID)) {
                    const startDate = filter.value.start;
                    if (startDate) {
                        const start = moment.utc(startDate);
                        // the backend doesn't support milliseconds so we round up to the next second here
                        if (start.milliseconds() !== 0) {
                            start.add(1, 'second').startOf('second');
                        }
                        params[`start${capitalizeString(filter.key)}`] = start.format('YYYY-MM-DD[T]HH:mm:ss[Z]');
                    }
                    if (filter.value.end) {
                        params[`end${capitalizeString(filter.key)}`] = moment.utc(filter.value.end).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
                    }
                }
            });
        }
        return params;
    }
}
