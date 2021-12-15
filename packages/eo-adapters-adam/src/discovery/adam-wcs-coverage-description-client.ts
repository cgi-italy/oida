import proj4 from 'proj4';

import { AxiosInstanceWithCancellation, createAxiosInstance,
    getXmlStringNodeValue, EpsgIoDefinitionProvider
} from '@oidajs/core';


export type AdamWcsCoverageDescription = {
    id: string;
    srs: string;
    srsDef?: string;
    time: {
        start: Date;
        end: Date;
        size: number;
    };
    width: number;
    height: number;
    extent: number[];
    numBands: number;
    isTrueColor: boolean;
};

export type AdamWcCoverageDescriptionClientConfig = {
    wcsUrl: string;
    axiosInstance?: AxiosInstanceWithCancellation,
};

export class AdamWcsCoverageDescriptionClient {

    protected readonly axiosInstance_: AxiosInstanceWithCancellation;
    protected readonly wcsUrl_: string;
    protected readonly srsDefProvider_: EpsgIoDefinitionProvider;

    protected domParser_ = new DOMParser();
    protected xmlNamespaces_ = {
        ows: 'http://www.opengis.net/ows/1.1',
        gml: 'http://www.opengis.net/gml/3.2',
        wcs: 'http://www.opengis.net/wcs/2.0',
        gmlcov: 'http://www.opengis.net/gmlcov/1.0',
        swe: 'http://www.opengis.net/swe/2.0'
    };

    constructor(config: AdamWcCoverageDescriptionClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.wcsUrl_ = config.wcsUrl;

        this.srsDefProvider_ = new EpsgIoDefinitionProvider({
            axiosInstance: this.axiosInstance_
        });
    }

    getCoverageDetails(coverageId: string): Promise<AdamWcsCoverageDescription[]> {
        return this.axiosInstance_.request<XMLDocument>({
            url: this.wcsUrl_,
            responseType: 'document',
            params: {
                service: 'WCS',
                request: 'DescribeCoverage',
                version: '2.0.0',
                coverageId: coverageId
            }
        }).then((response) => {
            const coverages = this.parseDescribeCoverageResponse_(response.data);
            return Promise.all(coverages.map((coverage) => {
                //retrieve missing srs definitions
                if (!proj4.defs(coverage.srs)) {
                    return this.srsDefProvider_.getSrsDefinition(coverage.srs).then((srsDef) => {
                        return {
                            ...coverage,
                            srsDef: srsDef
                        } as AdamWcsCoverageDescription;
                    });
                } else {
                    return Promise.resolve(coverage);
                }
            }));
        });
    }

    protected parseDescribeCoverageResponse_(doc: XMLDocument) {

        try {
            const coverageDescriptions = doc.getElementsByTagNameNS(this.xmlNamespaces_.wcs, 'CoverageDescription');

            const coverages: AdamWcsCoverageDescription[] = [];
            const parsedCoverages = new Set<string>();

            Array.from(coverageDescriptions).forEach((coverageDescription) => {
                try {
                    const coverage = this.parseCoverage_(coverageDescription);
                    if (!parsedCoverages.has(coverage.id)) {
                        coverages.push(coverage);
                        parsedCoverages.add(coverage.id);
                    }
                } catch (error) {
                }
            });

            return coverages;

        } catch (error) {
            throw new Error('AdamOpensearchDatasetFactory: unable to parse describeCoverage response');
        }
    }

    protected parseCoverage_(coverageDescription: Element) {
        const coverageId = coverageDescription.getAttributeNS(this.xmlNamespaces_.gml, 'id');
        if (!coverageId) {
            throw new Error();
        }

        const envelope = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'Envelope')[0];
        const axesAttr = envelope.getAttribute('axisLabels');

        let yAxisIdx = 0;
        let xAxisIdx = 1;
        let timeAxisIdx = 2;

        if (axesAttr) {
            const axes = axesAttr.split(' ').forEach((axis, idx) => {
                if (axis === 'E' || axis === 'Long') {
                    xAxisIdx = idx;
                } else if (axis === 'N' || axis === 'Lat') {
                    yAxisIdx = idx;
                } else if (axis === 't') {
                    timeAxisIdx = idx;
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

        const upperCorner = upperCornerString.split(' ').map((value => parseFloat(value)));

        let gridSize = [0, 0, 1];
        const gridEnvelopeNode = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'GridEnvelope')[0];
        if (gridEnvelopeNode) {
            const highValue = getXmlStringNodeValue(gridEnvelopeNode.getElementsByTagNameNS(this.xmlNamespaces_.gml, 'high')[0]);
            if (highValue) {
                gridSize = highValue.split(' ').map(value => parseInt(value));
            }
        }

        const fields = coverageDescription.getElementsByTagNameNS(this.xmlNamespaces_.swe, 'field');

        let isTrueColor = false;
        if (fields.length === 3) {
            const bandType = fields[0].getElementsByTagNameNS(this.xmlNamespaces_.swe, 'Quantity')[0].getAttribute('definition');
            if (bandType?.search('unsignedByte') !== -1) {
                isTrueColor = true;
            }
        }

        return {
            id: coverageId,
            srs,
            time: {
                start: new Date(lowerCorner[timeAxisIdx] * 1000),
                end: new Date(upperCorner[timeAxisIdx] * 1000),
                size: gridSize[timeAxisIdx]
            },
            numBands: fields.length,
            isTrueColor: isTrueColor,
            width: gridSize[xAxisIdx],
            height: gridSize[yAxisIdx],
            extent: [lowerCorner[xAxisIdx], lowerCorner[yAxisIdx], upperCorner[xAxisIdx], upperCorner[yAxisIdx]]
        };
    }
}
