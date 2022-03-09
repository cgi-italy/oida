import moment from 'moment';
import bboxPolygon from '@turf/bbox-polygon';
import rewind from '@turf/rewind';

import {
    AoiValue,
    AOI_FIELD_ID,
    AxiosInstanceWithCancellation,
    BOOLEAN_FIELD_ID,
    createAxiosInstance,
    DateRangeValue,
    DATE_FIELD_ID,
    DATE_RANGE_FIELD_ID,
    ENUM_FIELD_ID,
    QueryParams,
    SortOrder,
    STRING_FIELD_ID
} from '@oidajs/core';

export type AdamOpensearchDatasetMetadataGridName = {
    id: string;
    label: string;
    values: Array<{
        label: string;
        value: string | string[];
    }>;
};

export type AdamOpensearchDatasetCustomGridSpec = {
    SubRegion: Record<
        string,
        {
            value: string;
            scenes: Array<{
                scene_type: string;
                scene_type_values: Array<Record<string, number>>;
            }>;
        }
    >;
    Product: Record<string, string>;
};

export type AdamOpensearchDatasetMetadataSubdataset = {
    subDatasetId: string;
    name: string;
    minValue: number;
    maxValue: number;
    noDataValue: number;
    minDate: string;
    maxDate: string;
    geometry: GeoJSON.Geometry;
    grid?: boolean;
    gridType?: string;
    gridNames?: AdamOpensearchDatasetMetadataGridName[];
    defaultViewMode?: string[];
};

export type AdamOpensearchDatasetMetadata = {
    datasetId: string;
    title: string;
    datasetType: 'Raster' | 'Vertical' | 'Tomo';
    geometry: GeoJSON.Geometry;
    subDataset: AdamOpensearchDatasetMetadataSubdataset[];
    description: string;
    datasetSpecification: string;
    minDate: string;
    maxDate: string;
};

export type AdamOpensearchProductMetadata = {
    geometry: GeoJSON.Polygon;
    source: string;
    sourceRasterGeo?: string;
    datasetId: string;
    subDatasetId: string;
    title: string;
    productDate: string;
    EPSG?: string;
    single_multiband: string;
    abstract?: {
        Identifier: string;
        Start: string;
        End: string;
    };
    metadata?: {
        identifier: string;
        datasetId: string;
        subDatasetId: string;
        title: string;
        date: string;
        minValue: number;
        maxValue: number;
        EPSG: string;
        single_multiband: string;
    };
};

export type AdamDatasetDiscoveryRequest = {
    maxRecords?: number;
    startIndex?: number;
    order?: string;
    sortOrder?: 'ASC' | 'DESC';
};

export type AdamOpensearchDatasetDiscoveryResponse = {
    type: 'FeatureCollection';
    properties: {
        totalResults: number;
        startIndex: number;
        itemPerPage: number;
    };
    features: AdamOpensearchDatasetMetadata[];
};

export type AdamOpensearchProductSearchResponse = {
    type: 'FeatureCollection';
    properties: {
        totalResults: number;
        startIndex: number;
        itemPerPage: number;
    };
    features: AdamOpensearchProductMetadata[];
};

export enum AdamOpensearchMetadataModelVersion {
    V1 = 'v1',
    V2 = 'v2',
    V3 = 'v3'
}

export type AdamOpenSearchClientConfig = {
    serviceUrl: string;
    axiosInstance?: AxiosInstanceWithCancellation;
    metadataModelVersion?: AdamOpensearchMetadataModelVersion;
};

export class AdamOpenSearchClient {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected serviceUrl_: string;
    protected metadataModelVersion_: AdamOpensearchMetadataModelVersion;

    constructor(config: AdamOpenSearchClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.serviceUrl_ = config.serviceUrl;
        this.metadataModelVersion_ = config.metadataModelVersion || AdamOpensearchMetadataModelVersion.V3;
    }

    getDatasets(queryParams: QueryParams) {
        const params: AdamDatasetDiscoveryRequest = {};

        if (this.metadataModelVersion_ === AdamOpensearchMetadataModelVersion.V3) {
            if (queryParams.paging) {
                params.maxRecords = queryParams.paging.pageSize;
                params.startIndex = queryParams.paging.offset;
            }
            if (queryParams.sortBy) {
                params.order = queryParams.sortBy.key;
                params.sortOrder = queryParams.sortBy.order === SortOrder.Descending ? 'DESC' : 'ASC';
            }
        }

        if (queryParams.filters) {
            queryParams.filters.forEach((filter) => {
                if (filter.type === STRING_FIELD_ID || filter.type === ENUM_FIELD_ID) {
                    params[filter.key] = filter.value;
                } else if (filter.type === BOOLEAN_FIELD_ID) {
                    params[filter.key] = filter.value ? 'true' : 'false';
                    if (filter.key === 'geolocated' && this.metadataModelVersion_ === AdamOpensearchMetadataModelVersion.V3) {
                        params[filter.key] = filter.value ? 'True' : 'False';
                    }
                } else if (filter.type === DATE_FIELD_ID) {
                    params[filter.key] = filter.value.toISOString();
                }
            });
        }

        return this.axiosInstance_
            .request<AdamOpensearchDatasetDiscoveryResponse>({
                url: `${this.serviceUrl_}/datasets`,
                params: params
            })
            .then((response) => {
                return response.data;
            });
    }

    searchProducts(queryParams: QueryParams) {
        const params: AdamDatasetDiscoveryRequest = {};
        if (queryParams.paging) {
            params.maxRecords = queryParams.paging.pageSize;
            params.startIndex = queryParams.paging.offset;
        }

        if (queryParams.filters) {
            queryParams.filters.forEach((filter) => {
                if (filter.type === BOOLEAN_FIELD_ID) {
                    params[filter.key] = filter.value ? 'true' : 'false';
                    if (filter.key === 'geolocated' && this.metadataModelVersion_ === AdamOpensearchMetadataModelVersion.V3) {
                        params[filter.key] = filter.value ? 'True' : 'False';
                    }
                } else if (filter.type === STRING_FIELD_ID || filter.type === ENUM_FIELD_ID) {
                    params[filter.key] = filter.value;
                } else if (filter.type === DATE_RANGE_FIELD_ID) {
                    const startDate = (filter.value as DateRangeValue).start;
                    if (startDate) {
                        const start = moment(startDate);
                        // the backend doesn't support milliseconds so we round up to the next second here
                        if (start.milliseconds() !== 0) {
                            start.add(1, 'second').startOf('second');
                        }
                        params['startDate'] = start.toISOString();
                    }
                    if ((filter.value as DateRangeValue).end) {
                        params['endDate'] = (filter.value as DateRangeValue).end.toISOString();
                    }
                } else if (filter.type === DATE_FIELD_ID) {
                    params[filter.key] = filter.value.toISOString();
                } else if (filter.type === AOI_FIELD_ID) {
                    const geometry = (filter.value as AoiValue).geometry;
                    let polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined;
                    if (geometry.type === 'BBox') {
                        polygon = bboxPolygon(geometry.bbox).geometry;
                    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                        polygon = rewind(geometry);
                    }
                    if (polygon) {
                        params[filter.key] = JSON.stringify(polygon);
                    }
                }
            });
        }

        if (queryParams.sortBy) {
            if (queryParams.sortBy.key !== 'productDate') {
                params['order'] = queryParams.sortBy.key;
            }
            if (this.metadataModelVersion_ === AdamOpensearchMetadataModelVersion.V3) {
                if (queryParams.sortBy.order === SortOrder.Ascending) {
                    params['sortOrder'] = 'ASC';
                } else {
                    params['sortOrder'] = 'DESC';
                }
            }
        }

        return this.axiosInstance_
            .request<AdamOpensearchProductSearchResponse>({
                url: `${this.serviceUrl_}/search`,
                params: params
            })
            .then((response) => {
                return response.data;
            });
    }
}
