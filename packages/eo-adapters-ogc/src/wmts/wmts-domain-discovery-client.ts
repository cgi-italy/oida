import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';

export type WmtsDomainDiscoveryClientConfig = {
    axiosInstance?: AxiosInstanceWithCancellation;
};

/**
 * A client for the WMTS multidimensional domain discovery extension
 * https://docs.geoserver.org/stable/en/user/community/wmts-multidimensional/index.html
 *
 */
export class WmtsDomainDiscoveryClient {
    private domParser = new DOMParser();
    private xmlNamespaces = {
        ows: 'http://www.opengis.net/ows/1.1',
        wmts_md: 'http://demo.geo-solutions.it/share/wmts-multidim/wmts_multi_dimensional.xsd',
        wmts: 'http://www.opengis.net/wmts/1.0'
    };

    private axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config?: WmtsDomainDiscoveryClientConfig) {
        this.axiosInstance_ = config?.axiosInstance || createAxiosInstance();
    }

    describeDomains(parameters: {
        url: string;
        layer: string;
        tileMatrix: string;
        bbox?: string;
        version?: string;
        restrictions?: Array<{ dimension: string; range: string }>;
        domains?: string;
        expandLimit?: number;
    }) {
        let params: any = {
            service: 'WMTS',
            version: parameters.version || '1.0.0',
            request: 'DescribeDomains',
            layer: parameters.layer,
            TileMatrixSet: parameters.tileMatrix
        };

        if (parameters.bbox) {
            params.BBOX = parameters.bbox;
        }

        if (parameters.expandLimit) {
            params.expandLimit = parameters.expandLimit;
        }

        parameters.restrictions = parameters.restrictions || [];

        params = parameters.restrictions.reduce((options, item) => {
            return {
                [item.dimension]: item.range,
                ...options
            };
        }, params);

        if (parameters.domains) {
            params.Domains = parameters.domains;
        }

        return this.axiosInstance_
            .cancelableRequest({
                url: parameters.url,
                params: params
            })
            .then((response) => {
                return this.parseDescribeDomainsResponse(response.data);
            });
    }

    getHistogram(parameters: {
        url: string;
        layer: string;
        tileMatrix: string;
        dimension: string;
        resolution?: string;
        bbox?: string;
        restrictions?: Array<{ dimension: string; range: string }>;
        version?: string;
    }) {
        let params: any = {
            service: 'WMTS',
            version: parameters.version || '1.0.0',
            request: 'GetHistogram',
            layer: parameters.layer,
            histogram: parameters.dimension,
            TileMatrixSet: parameters.tileMatrix,
            resolution: parameters.resolution
        };

        if (parameters.bbox) {
            params.BBOX = parameters.bbox;
        }

        parameters.restrictions = parameters.restrictions || [];

        params = parameters.restrictions.reduce((options, item) => {
            return {
                [item.dimension]: item.range,
                ...options
            };
        }, params);

        return this.axiosInstance_
            .cancelableRequest({
                url: parameters.url,
                params: params
            })
            .then((response) => {
                return this.parseGetHistogramResponse(response.data);
            });
    }

    getFeature(parameters: {
        url: string;
        layer: string;
        tileMatrix: string;
        bbox?: string;
        restrictions?: Array<{ dimension: string; range: string }>;
        version?: string;
    }) {
        let params: any = {
            service: 'WMTS',
            version: parameters.version || '1.0.0',
            request: 'GetFeature',
            layer: parameters.layer,
            tileMatrix: parameters.tileMatrix
        };

        if (parameters.bbox) {
            params.BBOX = parameters.bbox;
        }

        parameters.restrictions = parameters.restrictions || [];

        params = parameters.restrictions.reduce((options, item) => {
            return {
                [item.dimension]: item.range,
                ...options
            };
        }, params);

        return this.axiosInstance_
            .cancelableRequest({
                url: parameters.url,
                params: params
            })
            .then((response) => {
                return this.parseGetFeatureResponse(response.data);
            });
    }

    private parseDescribeDomainsResponse(response) {
        try {
            const doc = this.domParser.parseFromString(response, 'application/xml');

            const domains = doc.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Domains')[0];

            const output: any = {};

            const spaceDimension = domains.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'SpaceDomain')[0];
            if (spaceDimension) {
                const bboxTag = spaceDimension.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'BoundingBox')[0];

                if (bboxTag) {
                    output.bbox = {
                        crs: bboxTag.getAttribute('CRS') || 'EPSG:4326',
                        minx: parseFloat(bboxTag.getAttribute('minx') || 'NaN'),
                        maxx: parseFloat(bboxTag.getAttribute('maxx') || 'NaN'),
                        miny: parseFloat(bboxTag.getAttribute('miny') || 'NaN'),
                        maxy: parseFloat(bboxTag.getAttribute('maxy') || 'NaN')
                    };
                }
            }

            const dimensions = domains.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'DimensionDomain');

            output.domains = Array.from(dimensions).map((item) => {
                const rangeNode = item.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Domain')[0].childNodes[0];

                return {
                    dimension: item.getElementsByTagNameNS(this.xmlNamespaces.ows, 'Identifier')[0].childNodes[0].nodeValue,
                    range: rangeNode ? rangeNode.nodeValue : null,
                    size: parseInt(item.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Size')[0].childNodes[0].nodeValue || 'NaN')
                };
            });

            return output;
        } catch (e) {
            return null;
        }
    }

    private parseGetHistogramResponse(response) {
        const doc = this.domParser.parseFromString(response, 'application/xml');

        const histogram = doc.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Histogram')[0];
        const range = histogram.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Domain')[0].childNodes[0];
        const values = histogram.getElementsByTagNameNS(this.xmlNamespaces.wmts_md, 'Values')[0].childNodes[0];

        return {
            range: range ? range.nodeValue : null,
            values: values
                ? values.nodeValue!.split(',').map((val) => {
                      return parseInt(val);
                  })
                : []
        };
    }

    private parseGetFeatureResponse(response) {
        const doc = this.domParser.parseFromString(response, 'application/xml');
        const collection = doc.getElementsByTagNameNS(this.xmlNamespaces.wmts, 'FeatureCollection')[0];
        const features = collection.getElementsByTagNameNS(this.xmlNamespaces.wmts, 'feature');

        return Array.from(features).map((item) => {
            const dimensions_el = item.getElementsByTagNameNS(this.xmlNamespaces.wmts, 'dimension');
            const dimensions = Array.from(dimensions_el).map((dimension) => {
                return {
                    name: dimension.getAttribute('name'),
                    value: dimension.childNodes[0].nodeValue
                };
            });

            return {
                dimensions: dimensions,
                footprint: []
            };
        });
    }
}
