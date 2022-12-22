import moment from 'moment';

import {
    QueryParams,
    SortOrder,
    getGeometryExtent,
    AxiosInstanceWithCancellation,
    createAxiosInstance,
    BBoxGeometry,
    QueryFilter,
    AOI_FIELD_ID,
    DATE_RANGE_FIELD_ID
} from '@oidajs/core';

import { DatasetProductSearchProvider } from '@oidajs/eo-mobx';

import { AdamServiceParamsSerializer } from '../utils';

export type AdamWcsPreviewConfig = {
    serviceUrl: string;
    coverageId: string;
    colorTable?: string;
    colorRange?: {
        min: number;
        max: number;
    };
    subsets?: string[];
    size: number;
};

export type AdamCswProductSearchProviderConfig = {
    serviceUrl: string;
    wcsPreview: AdamWcsPreviewConfig;
    extentOffset?: number[];
    collectionId: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class AdamCswProductSearchProvider implements DatasetProductSearchProvider {
    protected config_: AdamCswProductSearchProviderConfig;

    protected axiosInstance_: AxiosInstanceWithCancellation;

    private domParser = new DOMParser();
    private xmlNamespaces = {
        atom: 'http://www.w3.org/2005/Atom',
        os: 'http://a9.com/-/spec/opensearch/1.1/',
        georss: 'http://www.georss.org/georss',
        gml: 'http://www.opengis.net/gml'
    };

    constructor(config: AdamCswProductSearchProviderConfig) {
        this.config_ = config;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
    }

    searchProducts(queryParams: QueryParams) {
        return this.axiosInstance_
            .cancelableRequest({
                url: this.config_.serviceUrl,
                params: {
                    service: 'CSW',
                    version: '2.0.2',
                    request: 'GetRecords',
                    typenames: 'csw:Record',
                    resulttype: 'results',
                    elementsetname: 'full',
                    mode: 'opensearch',
                    q: this.config_.collectionId,
                    ...this.geCSWParams_(queryParams)
                },
                responseType: 'document',
                paramsSerializer: AdamServiceParamsSerializer
            })
            .then((response) => {
                return this.parseGetRecordResponse_(response.data);
            });
    }

    protected geCSWParams_(queryParams: QueryParams) {
        let cswParams: any = {};

        if (queryParams.paging) {
            cswParams.startPosition = queryParams.paging.offset + 1;
            cswParams.maxRecords = queryParams.paging.pageSize;
        }
        if (queryParams.sortBy) {
            cswParams.SortBy = `${queryParams.sortBy.key}:${queryParams.sortBy.order === SortOrder.Ascending ? 'A' : 'D'}`;
        }

        if (queryParams.filters) {
            cswParams = {
                ...cswParams,
                ...this.filterSerializer_(queryParams.filters)
            };
        }

        return cswParams;
    }

    protected filterSerializer_(filters: QueryFilter[]) {
        const filterParams: any = {};

        filters.forEach((filter) => {
            if (filter.type === AOI_FIELD_ID) {
                const geom = filter.value.geometry;
                let bbox = getGeometryExtent(geom);

                if (bbox) {
                    const extentOffset = this.config_.extentOffset;
                    if (extentOffset) {
                        bbox = [bbox[0] + extentOffset[0], bbox[1] + extentOffset[1], bbox[2] + extentOffset[0], bbox[3] + extentOffset[1]];
                    }
                    filterParams.bbox = bbox.join(',');
                }
            } else if (filter.type === DATE_RANGE_FIELD_ID) {
                filterParams.time = `${filter.value.start ? moment.utc(filter.value.start).toISOString() : ''}/${
                    filter.value.end ? moment.utc(filter.value.end).toISOString() : ''
                }`;
            }
        });

        return filterParams;
    }

    protected parseGetRecordResponse_(doc: Document) {
        try {
            const feed = doc.getElementsByTagNameNS(this.xmlNamespaces.atom, 'feed')[0];

            const totalResults = parseInt(feed.getElementsByTagNameNS(this.xmlNamespaces.os, 'totalResults')[0].childNodes[0].nodeValue!);

            //adam csw catalogue has a server side limit of 10 records and the content of itemsPerPage
            //node is not reliable on last page response so we fix it here
            const pageSize = 10; // parseInt(feed.getElementsByTagNameNS(this.xmlNamespaces.os, 'itemsPerPage')[0].childNodes[0].nodeValue!);

            const entries = feed.getElementsByTagNameNS(this.xmlNamespaces.atom, 'entry');
            const records = Array.from(entries).map((entry) => {
                const summaryNode = entry.getElementsByTagNameNS(this.xmlNamespaces.atom, 'summary')[0];
                const summary = this.domParser.parseFromString(summaryNode.childNodes[0].nodeValue!, 'text/html');
                const columns = summary.getElementsByTagName('td');

                const properties: any = {};
                Array.from(columns).forEach((column, idx) => {
                    const fieldName = column.getElementsByTagName('strong')[0];
                    if (fieldName) {
                        const fieldValue = columns[idx + 1].childNodes[0].nodeValue;
                        properties[fieldName.childNodes[0].nodeValue!] = fieldValue;
                    }
                });

                const envelope = entry.getElementsByTagNameNS(this.xmlNamespaces.gml, 'Envelope')[0];
                const lowerCorner = envelope
                    .getElementsByTagNameNS(this.xmlNamespaces.gml, 'lowerCorner')[0]
                    .childNodes[0].nodeValue!.split(' ')
                    .map((coord) => parseFloat(coord));
                const upperCorner = envelope
                    .getElementsByTagNameNS(this.xmlNamespaces.gml, 'upperCorner')[0]
                    .childNodes[0].nodeValue!.split(' ')
                    .map((coord) => parseFloat(coord));

                const bbox = [lowerCorner[1], lowerCorner[0], upperCorner[1], upperCorner[0]];

                const extentOffset = this.config_.extentOffset;
                if (extentOffset) {
                    bbox[0] -= extentOffset[0];
                    bbox[2] -= extentOffset[0];
                    bbox[1] -= extentOffset[1];
                    bbox[3] -= extentOffset[1];
                }

                return {
                    id: properties.Identifier,
                    start: moment.utc(properties.Start).toDate(),
                    preview: this.getWcsPreview_(properties),
                    geometry: {
                        type: 'BBox',
                        bbox: bbox
                    } as BBoxGeometry
                };
            });

            return {
                total: totalResults,
                results: records,
                pageSize: pageSize
            };
        } catch (e) {
            return {
                total: 0,
                results: []
            };
        }
    }

    protected getWcsPreview_(record) {
        const wcsParams = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: this.config_.wcsPreview.coverageId,
            subset: [`unix(${record.Start},${record.End})`, ...(this.config_.wcsPreview.subsets || [])],
            format: 'image/png',
            colortable: this.config_.wcsPreview.colorTable,
            size: `(${this.config_.wcsPreview.size},${this.config_.wcsPreview.size})`
        };

        return `${this.config_.wcsPreview.serviceUrl}?${AdamServiceParamsSerializer(wcsParams)}`;
    }
}
