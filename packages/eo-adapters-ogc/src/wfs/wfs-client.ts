import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';
import {
    WfsCountAttributeTemplate,
    WfsGetFeaturesRequestTemplate,
    WfsOffsetAttributeTemplate,
    WfsSortByClauseTemplate,
    WfsSrsNameAttributeTemplate,
    WFS_PROPERTY_NAMES_PLACEHOLDER,
    WFS_TEMPLATE_COUNT_ATTR_PLACEHOLDER,
    WFS_TEMPLATE_COUNT_VALUE_PLACEHOLDER,
    WFS_TEMPLATE_FEATURE_TYPENAME_PLACEHOLDER,
    WFS_TEMPLATE_FILTERS_PLACEHOLDER,
    WFS_TEMPLATE_OFFSET_ATTR_PLACEHOLDER,
    WFS_TEMPLATE_OFFSET_VALUE_PLACEHOLDER,
    WFS_TEMPLATE_OUTPUT_FORMAT_PLACEHOLDER,
    WFS_TEMPLATE_SORT_BY_PLACEHOLDER,
    WFS_TEMPLATE_SORT_CLAUSE_PLACEHOLDER,
    WFS_TEMPLATE_SORT_ORDER_PLACEHOLDER,
    WFS_TEMPLATE_SRSNAME_ATTR_PLACEHOLDER,
    WFS_TEMPLATE_SRSNAME_VALUE_PLACEHOLDER
} from './wfs-post-request-templates';

export type WfsVendor = 'geoserver';

export type WfsClientConfig = {
    axiosInstance?: AxiosInstanceWithCancellation;
    vendor?: WfsVendor;
};

export type WfsGetFeaturesRequest = {
    serviceUrl: string;
    typeName: string;
    featureId?: string;
    count?: number;
    offset?: number;
    sortBy?: string;
    properties?: string[];
    fesFilter?: string;
    cqlFilter?: string;
    bbox?: number[];
};

export type WfsFeature = {
    type: 'Feature';
    id: string;
    geometry?: GeoJSON.Geometry;
    geometry_name?: string;
    properties: Record<string, any>;
    bbox?: number[];
};

export type WfsGetFeaturesResponse = {
    totalFeatures: number;
    numberReturned: number;
    bbox: number[];
    features: WfsFeature[];
    type: 'FeatureCollection';
};

/**
 * A WFS 2.0 client
 */
export class WfsClient {
    protected vendor_?: WfsVendor;
    protected axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: WfsClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.vendor_ = config.vendor;
    }

    public getFeatures(request: WfsGetFeaturesRequest): Promise<WfsGetFeaturesResponse> {
        const requestParams: Record<string, string | number> = {
            service: 'WFS',
            version: '2.0.0',
            request: 'GetFeature',
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            typeNames: request.typeName
        };

        if (request.count !== undefined) {
            requestParams.count = request.count;
        }
        if (request.offset !== undefined) {
            requestParams.startIndex = request.offset;
        }
        if (request.sortBy !== undefined) {
            requestParams.sortBy = request.sortBy;
        }
        if (request.properties && request.properties.length) {
            requestParams.propertyName = request.properties.join(',');
        }
        if (request.fesFilter) {
            requestParams.filter = request.fesFilter;
        }
        if (request.cqlFilter) {
            requestParams.cql_filter = request.cqlFilter;
        }
        if (request.bbox) {
            requestParams.bbox = `${request.bbox[1]},${request.bbox[0]},${request.bbox[3]},${request.bbox[2]}`;
        }
        if (request.featureId) {
            requestParams.featureID = request.featureId;
        }

        return this.axiosInstance_
            .request<WfsGetFeaturesResponse>({
                method: 'GET',
                url: request.serviceUrl,
                params: requestParams
            })
            .then((response) => {
                return response.data;
            });
    }

    public getFeaturesPost(request: Omit<WfsGetFeaturesRequest, 'cqlFilter' | 'bbox'>): Promise<WfsGetFeaturesResponse> {
        let postContent = WfsGetFeaturesRequestTemplate.replace(WFS_TEMPLATE_OUTPUT_FORMAT_PLACEHOLDER, 'application/json')
            .replace(WFS_TEMPLATE_FEATURE_TYPENAME_PLACEHOLDER, request.typeName)
            .replace(
                WFS_TEMPLATE_SRSNAME_ATTR_PLACEHOLDER,
                WfsSrsNameAttributeTemplate.replace(WFS_TEMPLATE_SRSNAME_VALUE_PLACEHOLDER, 'urn:x-ogc:def:crs:EPSG:4326')
            )
            .replace(
                WFS_TEMPLATE_COUNT_ATTR_PLACEHOLDER,
                request.count ? WfsCountAttributeTemplate.replace(WFS_TEMPLATE_COUNT_VALUE_PLACEHOLDER, `${request.count}`) : ''
            )
            .replace(
                WFS_TEMPLATE_OFFSET_ATTR_PLACEHOLDER,
                request.offset ? WfsOffsetAttributeTemplate.replace(WFS_TEMPLATE_OFFSET_VALUE_PLACEHOLDER, `${request.offset}`) : ''
            )
            .replace(WFS_TEMPLATE_FILTERS_PLACEHOLDER, request.fesFilter ? request.fesFilter : '');

        if (request.sortBy) {
            let [sortProperty, sortOrder] = request.sortBy.split('+');
            if (sortOrder === 'D') {
                sortOrder = 'DESC';
            } else {
                sortOrder = 'ASC';
            }
            postContent = postContent.replace(
                WFS_TEMPLATE_SORT_CLAUSE_PLACEHOLDER,
                WfsSortByClauseTemplate.replace(WFS_TEMPLATE_SORT_BY_PLACEHOLDER, sortProperty).replace(
                    WFS_TEMPLATE_SORT_ORDER_PLACEHOLDER,
                    sortOrder
                )
            );
        } else {
            postContent = postContent.replace(WFS_TEMPLATE_SORT_CLAUSE_PLACEHOLDER, '');
        }

        const propertyClauses = request.properties?.map((property) => {
            return `<wfs:PropertyName>${property}</wfs:PropertyName>`;
        });

        postContent = postContent.replace(WFS_PROPERTY_NAMES_PLACEHOLDER, propertyClauses ? propertyClauses.join('\n') : '');

        return this.axiosInstance_
            .request<WfsGetFeaturesResponse>({
                method: 'POST',
                url: request.serviceUrl,
                data: postContent,
                headers: { 'Content-Type': 'text/xml' }
            })
            .then((response) => {
                return response.data;
            });
    }
}
