import { AxiosInstanceWithCancellation, createAxiosInstance, getXmlDateNodeValue, getXmlFloatNodeValue, getXmlStringNodeValue } from '@oida/core';
import { NumericVariable, ValueDomain } from '@oida/eo-mobx';

export type WcsVendor = 'geoserver';

export type WcsCoverageBand = Omit<NumericVariable, 'domain'> & {
    domain?: ValueDomain<number>
};

export type WcsCoverage = {
    id: string;
    srs: string;
    time: {
        start: Date;
        end: Date;
    } | undefined;
    width: number;
    height: number;
    extent: number[];
    bands: WcsCoverageBand[];
};

export type WcsClientConfig = {
    vendor: WcsVendor;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class WcsClient {

    protected vendor_: WcsVendor;
    protected axiosInstance_: AxiosInstanceWithCancellation;

    protected domParser_ = new DOMParser();
    protected xmlNamespaces_ = {
        ows: 'http://www.opengis.net/ows/1.1',
        gml: 'http://www.opengis.net/gml/3.2',
        wcs: 'http://www.opengis.net/wcs/2.0',
        swe: 'http://www.opengis.net/swe/2.0'
    };

    constructor(config: WcsClientConfig) {
        this.vendor_ = config.vendor;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
    }

    describeCoverage(params: {
        url: string,
        coverageId: string
    }): Promise<WcsCoverage> {
        return this.axiosInstance_.cancelableRequest<XMLDocument>({
            url: params.url,
            responseType: 'document',
            params: {
                service: 'WCS',
                version: '2.0.1',
                request: 'DescribeCoverage',
                coverageId: params.coverageId
            }
        }).then((response) => {
            if (this.vendor_ === 'geoserver') {
                return this.parseGeoserverDescribeCoverageResponse_(response.data);
            } else {
                throw new Error('WcsClient: Unknown WCS vendor');
            }
        });
    }

    protected parseGeoserverDescribeCoverageResponse_(doc: XMLDocument) {
        try {
            const coverageDescriptions = doc.getElementsByTagNameNS(this.xmlNamespaces_.wcs, 'CoverageDescription');
            return this.parseGeoserverCoverage_(coverageDescriptions[0]);
        } catch (e) {
            throw new Error('WcsClient: Unable to parse describe coverage response');
        }
    }

    protected parseGeoserverCoverage_(coverageDescription: Element): WcsCoverage {

        const coverageId = getXmlStringNodeValue(coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.wcs, 'CoverageId')[0]);
        if (!coverageId) {
            throw new Error();
        }

        let envelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'Envelope')[0];
        if (!envelope) {
            envelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'EnvelopeWithTimePeriod')[0];
        }
        if (!envelope) {
            throw new Error('WcsClient: No envelope found in coverage description');
        }
        const axesAttr = envelope.getAttribute('axisLabels');

        let yAxisIdx = 0;
        let xAxisIdx = 1;

        if (axesAttr) {
            axesAttr.split(' ').forEach((axis, idx) => {
                if (axis === 'E' || axis === 'Long') {
                    xAxisIdx = idx;
                } else if (axis === 'N' || axis === 'Lat') {
                    yAxisIdx = idx;
                }
            });
        }

        let srs = 'EPSG:4326';

        let srsAttr = envelope.getAttribute('srsName');
        if (srsAttr) {
            const matches = srsAttr.match(/crs\/EPSG\/0\/([0-9]+)/);
            if (matches) {
                srs = `EPSG:${matches[1]}`;
            }
        }

        const lowerCornerString = getXmlStringNodeValue(envelope.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'lowerCorner')[0]);
        if (!lowerCornerString) {
            throw new Error();
        }
        const lowerCorner = lowerCornerString.split(' ').map((value => parseFloat(value)));

        const upperCornerString = getXmlStringNodeValue(envelope.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'upperCorner')[0]);
        if (!upperCornerString) {
            throw new Error();
        }


        const beginPosition = getXmlDateNodeValue(envelope.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'beginPosition')[0]);
        const endPosition = getXmlDateNodeValue(envelope.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'endPosition')[0]);

        const upperCorner = upperCornerString.split(' ').map((value => parseFloat(value)));

        let gridSize = [0, 0];
        const gridEnvelopeNode = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'GridEnvelope')[0];
        if (gridEnvelopeNode) {
            const highValue = getXmlStringNodeValue(gridEnvelopeNode.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'high')[0]);
            if (highValue) {
                gridSize = highValue.split(' ').map(value => parseInt(value));
            }
        }

        let bands: WcsCoverageBand[] = [];

        const dataRecordNode = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'DataRecord')[0];
        if (dataRecordNode) {
            const fieldNodes = dataRecordNode.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'field');
            bands = Array.from(fieldNodes).map((fieldNode, idx) => {
                const id = fieldNode.getAttribute('name') || (idx + 1).toString();
                const name = getXmlStringNodeValue(fieldNode.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'description')[0]);
                const uomNode = fieldNode.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'uom')[0];
                const units = uomNode ? uomNode.getAttribute('code') || '' : '';
                let domain: ValueDomain<number> | undefined;
                const allowedValuesString = getXmlStringNodeValue(fieldNode.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'interval')[0]);
                if (allowedValuesString) {
                    const allowedValues = allowedValuesString.split(' ');
                    domain = {
                        min: parseFloat(allowedValues[0]),
                        max: parseFloat(allowedValues[1]),
                        noData: getXmlFloatNodeValue(fieldNode.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'nilValue')[0])
                    };
                }
                return {
                    id: id,
                    name: name || id,
                    units: units,
                    domain: domain
                };
            });
        }

        return {
            id: coverageId,
            srs,
            time: beginPosition && endPosition ? {
                start: beginPosition,
                end: endPosition
            } : undefined,
            width: gridSize[xAxisIdx],
            height: gridSize[yAxisIdx],
            extent: [lowerCorner[xAxisIdx], lowerCorner[yAxisIdx], upperCorner[xAxisIdx], upperCorner[yAxisIdx]],
            bands: bands
        };
    }
}
