import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance, QueryParams, randomColorFactory } from '@oida/core';
import { AdamWcsCoverageDescriptionClient } from './adam-wcs-coverage-description-client';
import { AdamDatasetConfig, AdamDatasetDimension, AdamDatasetSingleBandCoverage, AdamDatasetMultiBandCoverage, AdamDatasetRenderMode } from '../adam-dataset-config';

export type AdamDatasetMetadataGridName = {[key: string]: string[]};

export type AdamDatasetMetadata = {
    datasetId: string;
    shortDatasetId: string;
    extendedDatasetName: string;
    datasetType: 'Raster' | 'Vertical' | 'Tomo';
    subdatasets?: number;
    description: string;
    minDate: string;
    maxDate: string;
    minValue: number;
    maxValue: number;
    noDataValue: number;
    gridNames?: AdamDatasetMetadataGridName[];
    subdatasetsNames: string[];
};

export type AdamDatasetDiscoveryRequest = {
    maxRecords?: number;
    startIndex?: number;
};

export type AdamDatasetDiscoveryResponse = {
    type: 'FeatureCollection',
    properties: {
        totalResults: number;
        startIndex: number;
        itemPerPage: number;
    }
    features: AdamDatasetMetadata[];
};

export type AdamOpensearchDatasetDiscoveryClientConfig = {
    serviceUrl: string;
    wcsUrl: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class AdamOpensearchDatasetDiscoveryClient {

    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected url_: string;
    protected wcsCoverageDescriptionClient_: AdamWcsCoverageDescriptionClient;
    protected readonly colorFactory_: () => string;

    constructor(config: AdamOpensearchDatasetDiscoveryClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.url_ = config.serviceUrl;
        this.wcsCoverageDescriptionClient_ = new AdamWcsCoverageDescriptionClient({
            wcsUrl: config.wcsUrl,
            axiosInstance: this.axiosInstance_
        });
        this.colorFactory_ = randomColorFactory();
    }

    searchDatasets(queryParams: QueryParams) {

        const params: AdamDatasetDiscoveryRequest = {};

        if (queryParams.paging) {
            params.maxRecords = queryParams.paging.pageSize;
            params.startIndex = queryParams.paging.offset;
        }

        return this.axiosInstance_.request<AdamDatasetDiscoveryResponse>({
            url: `${this.url_}/datasets`,
            params: params
        }).then((response) => {
            return response.data;
        });
    }

    getAdamDatasetConfig(metadata: AdamDatasetMetadata): Promise<AdamDatasetConfig> {
        return this.wcsCoverageDescriptionClient_.getCoverageDetails(metadata.shortDatasetId).then((coverageDetails) => {

            const dimensions: AdamDatasetDimension[] = [];
            if (metadata.gridNames) {
                metadata.gridNames.forEach((gridName, idx) => {
                    const [dimensionId, values] = Object.entries(gridName)[0];
                    dimensions.push({
                        id: dimensionId,
                        name: dimensionId,
                        wcsSubset: {
                            id: 'gfix',
                            idx: idx
                        },
                        wcsResponseKey: 'gfix',
                        tarFilenameRegex: /^/,
                        domain: values.map((label, idx) => {
                            return {
                                label: label,
                                value: idx + 1
                            };
                        })
                    });
                });
            }

            let minValue =  metadata.minValue;
            let maxValue = metadata.maxValue;

            const range = (maxValue - minValue) / 100;

            if (range < 1) {
                const precision = -Math.floor(Math.log10(range));
                minValue = parseFloat(minValue.toFixed(precision));
                maxValue = parseFloat(maxValue.toFixed(precision));
            } else {
                minValue = Math.floor(minValue);
                maxValue = Math.ceil(maxValue);
            }

            let coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;

            if (metadata.subdatasets && metadata.subdatasets > 1) {
                coverages = {
                   id: 'bands',
                   name: 'Bands',
                   wcsCoverage: metadata.shortDatasetId,
                   presets: [],
                   bandGroups: [{
                       id: 'bands',
                       name: 'Bands',
                       bandIndices: metadata.subdatasetsNames.map((subdatasetName, idx) => idx + 1)
                   }],
                   bands: metadata.subdatasetsNames.map((subdatasetName, idx) => {
                       return {
                           idx: idx + 1,
                           name: subdatasetName,
                           domain: {
                               min: minValue,
                               max: maxValue,
                               noData: metadata.noDataValue
                           }
                       };
                   })
                };
            } else {
                coverages = [{
                    id: `${metadata.shortDatasetId}_${metadata.subdatasetsNames[0]}`,
                    name: metadata.subdatasetsNames[0],
                    wcsCoverage: metadata.shortDatasetId,
                    domain: {
                        min: minValue,
                        max: maxValue
                    }
                }];
            }

            let fixedTime: Date | undefined;
            if (metadata.minDate === metadata.maxDate) {
                fixedTime = moment.utc(metadata.minDate).toDate();
            }

            return {
                id: metadata.shortDatasetId,
                color: this.colorFactory_(),
                type: 'raster',
                coverageExtent: coverageDetails.extent,
                coverageSrs: coverageDetails.srs,
                srsDef: coverageDetails.srsDef,
                name: metadata.datasetId,
                fixedTime: fixedTime,
                renderMode: AdamDatasetRenderMode.ClientSide,
                coverages: coverages,
                dimensions: dimensions
            };

        });
    }
}
