import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';

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
}
