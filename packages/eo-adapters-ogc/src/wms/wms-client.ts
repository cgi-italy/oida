import { AxiosResponse } from 'axios';
import WmsCapabilitiesParser from 'ol/format/WMSCapabilities';
import WmsFeatureInfoParser from 'ol/format/WMSGetFeatureInfo';
import GeoJsonParser from 'ol/format/GeoJSON';

import { AxiosInstanceWithCancellation, createAxiosInstance, getXmlStringNodeValue } from '@oidajs/core';

export type WmsClientConfig = {
    axiosInstance?: AxiosInstanceWithCancellation;
};

export type WmsLayerBBox = {
    crs: string;
    extent: number[];
    res: number[];
};

export type WmsLayerStyle = {
    Name: string;
    Title?: string;
    Abstract?: string;
    LegendURL: Array<{
        Format: string;
        OnlineResource: string;
        size: number[];
    }>;
};

export type WmsLayerDimension = {
    name: string;
    units: string;
    unitSymbol?: string;
    default?: string;
    multipleValues?: boolean;
    nearestvalue?: boolean;
    values: string;
};

export type WmsLayer = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    KeywordList?: string[];
    Identifier?: string[];
    CRS: string[];
    BoundingBox: WmsLayerBBox[];
    EX_GeographicBoundingBox: number[];
    Style?: WmsLayerStyle[];
    Dimension?: WmsLayerDimension[];
    queryable?: boolean;
    Layer?: WmsLayer[];
};

export type WmsCapabilities = {
    version: string;
    Service: {
        Name?: string;
        Title?: string;
        Abstract?: string;
        KeywordList?: string[];
    };
    Capability: {
        Request: {
            GetCapabilities: {
                Format: string[];
            };
            GetMap: {
                Format: string[];
            };
            GetFeatureInfo: {
                Format: string[];
            };
        };
        Layer: WmsLayer;
    };
};

export class WmsClient {
    private capabilitiesParser_: WmsCapabilitiesParser;
    private featureInfoParser_: WmsFeatureInfoParser;
    private geoJsonParser_: GeoJsonParser;
    private axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: WmsClientConfig = {}) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.capabilitiesParser_ = new WmsCapabilitiesParser();
        this.featureInfoParser_ = new WmsFeatureInfoParser();
        this.geoJsonParser_ = new GeoJsonParser();
    }

    getCapabilities(params: { url: string; version?: string }) {
        return this.axiosInstance_
            .cancelableRequest({
                url: params.url,
                params: {
                    service: 'WMS',
                    version: params.version || '1.3.0',
                    request: 'GetCapabilities'
                },
                responseType: 'text'
            })
            .then((response) => {
                try {
                    return this.capabilitiesParser_.read(response.data) as WmsCapabilities;
                } catch (e) {
                    throw new Error(`Error parsing WMS capabilities: ${e}`);
                }
            });
    }

    getFeatureInfo(params: {
        url: string;
        layers: string;
        styles: string;
        srs: string;
        bbox: number[];
        width: number;
        height: number;
        i: number;
        j: number;
        version?: string;
        count?: number;
        format?: string;
        vendorParams?: Record<string, any>;
    }) {
        const version = params.version || '1.3.0';
        const format = params.format || 'text/plain';

        const requestParams: Record<string, any> = {
            service: 'WMS',
            version: version,
            request: 'GetFeatureInfo',
            layers: params.layers,
            styles: params.styles,
            query_layers: params.layers,
            bbox: params.bbox.join(','),
            width: params.width,
            height: params.height,
            info_format: format,
            ...params.vendorParams
        };

        if (version === '1.3.0') {
            requestParams.i = params.i;
            requestParams.j = params.j;
            requestParams.crs = params.srs;
        } else {
            requestParams.x = params.i;
            requestParams.y = params.j;
            requestParams.srs = params.srs;
        }

        return this.axiosInstance_
            .cancelableRequest({
                url: params.url,
                params: requestParams,
                responseType: 'text'
            })
            .then((response) => {
                this.throwOnServiceException_(response);

                try {
                    switch (format) {
                        case 'text/plain':
                        case 'text/html':
                            return response.data;
                        case 'application/json':
                            return response.data;
                        default: {
                            const features = this.featureInfoParser_.readFeatures(response.data);
                            return this.geoJsonParser_.writeFeaturesObject(features);
                        }
                    }
                } catch (e) {
                    throw new Error(`Error parsing WMS feature info: ${e}`);
                }
            });
    }

    getTimeSeries(params: {
        url: string;
        layers: string;
        styles: string;
        srs: string;
        bbox: number[];
        width: number;
        height: number;
        i: number;
        j: number;
        time: string;
        version?: string;
        count?: number;
        format?: string;
        vendorParams?: Record<string, any>;
    }) {
        const version = params.version || '1.3.0';
        const format = params.format || 'text/csv';

        const requestParams: Record<string, any> = {
            service: 'WMS',
            version: version,
            request: 'GetTimeSeries',
            layers: params.layers,
            styles: params.styles,
            query_layers: params.layers,
            bbox: params.bbox.join(','),
            width: params.width,
            height: params.height,
            time: params.time,
            format: format,
            ...params.vendorParams
        };

        if (version === '1.3.0') {
            requestParams.i = params.i;
            requestParams.j = params.j;
            requestParams.crs = params.srs;
        } else {
            requestParams.x = params.i;
            requestParams.y = params.j;
            requestParams.srs = params.srs;
        }

        return this.axiosInstance_
            .cancelableRequest({
                url: params.url,
                params: requestParams
            })
            .then((response) => {
                this.throwOnServiceException_(response);
                return response.data;
            });
    }

    protected throwOnServiceException_(response: AxiosResponse) {
        //Sometimes geoserver returns a service exception XML with a 200 status code
        if (/xml/.test(response.headers['content-type'])) {
            const parser = new DOMParser();
            let errorMessage = 'Service error';
            try {
                const responseXml = parser.parseFromString(response.data, 'application/xml');
                const exceptionNode = responseXml.getElementsByTagName('ServiceException')[0];
                const error = getXmlStringNodeValue(exceptionNode);
                if (error) {
                    errorMessage = error;
                }
            } catch (error) {
                // do nothing
            }
            throw new Error(errorMessage);
        }
    }
}
