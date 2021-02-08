import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance, QueryParams, randomColorFactory, getGeometryExtent } from '@oida/core';
import { AdamWcsCoverageDescriptionClient } from './adam-wcs-coverage-description-client';
import { AdamDatasetConfig, AdamDatasetDimension, AdamDatasetSingleBandCoverage, AdamDatasetMultiBandCoverage, AdamDatasetRenderMode } from '../adam-dataset-config';

export type AdamDatasetMetadataGridName = {
    id: string;
    label: string;
    values: Array<{
        label: string;
        value: string;
    }>;
};

export type AdamDatasetMetadataSubdataset = {
    subDatasetId: string;
    name: string;
    minValue: number;
    maxValue: number;
    noDataValue: number;
    minDate: string;
    maxDate: string;
    geometry: GeoJSON.Geometry;
    grid?: boolean;
    gridNames?: AdamDatasetMetadataGridName[];
};

export type AdamDatasetMetadata = {
    datasetId: string;
    title: string;
    datasetType: 'Raster' | 'Vertical' | 'Tomo';
    geometry: GeoJSON.Geometry;
    subDataset: AdamDatasetMetadataSubdataset[];
    description: string;
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
            //params.maxRecords = queryParams.paging.pageSize;
            //params.startIndex = queryParams.paging.offset;
        }

        return this.axiosInstance_.request<AdamDatasetDiscoveryResponse>({
            url: `${this.url_}/datasets`,
            params: params
        }).then((response) => {
            return response.data;
        });
    }

    getAdamDatasetConfig(metadata: AdamDatasetMetadata): Promise<AdamDatasetConfig> {

        // disable WCS coverage description retrieval for now and always query the dataset using EPSG:4326
        // this is just a temporary measure and has some bad implications (i.e. the WCS data srs is different from the layer srs)

        //return this.wcsCoverageDescriptionClient_.getCoverageDetails(metadata.datasetId).then((coverageDetails) => {

            const dimensions: AdamDatasetDimension[] = [];
            let coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;

            if (metadata.subDataset.length > 1) {
                coverages = {
                   id: 'bands',
                   name: 'Bands',
                   wcsCoverage: metadata.datasetId,
                   presets: [],
                   bandGroups: [{
                       id: 'bands',
                       name: 'Bands',
                       bandIndices: metadata.subDataset.map((subdataset, idx) => idx + 1)
                   }],
                   bands: metadata.subDataset.map((subdataset, idx) => {
                       const [minValue, maxValue] = this.getRoundedMinMax_(subdataset.minValue, subdataset.maxValue);
                       return {
                           idx: idx + 1,
                           name: subdataset.name,
                           domain: {
                               min: minValue,
                               max: maxValue,
                               noData: subdataset.noDataValue
                           }
                       };
                   })
                };
            } else {
                const variable = metadata.subDataset[0];
                const [minValue, maxValue] = this.getRoundedMinMax_(variable.minValue, variable.maxValue);
                coverages = [{
                    id: `${metadata.datasetId}_${variable.name}`,
                    name: variable.name,
                    wcsCoverage: metadata.datasetId,
                    domain: {
                        min: minValue,
                        max: maxValue
                    }
                }];

                if (variable.grid && variable.gridNames) {
                    //TODO: remove the reverse once the discovery metadata are coherent
                    variable.gridNames.forEach((gridName, idx) => {
                        dimensions.push({
                            id: gridName.id,
                            name: gridName.label,
                            wcsSubset: {
                                id: 'gfix',
                                idx: idx
                            },
                            wcsResponseKey: 'gfix',
                            tarFilenameRegex: /^/,
                            domain: gridName.values.map((item) => {
                                return {
                                    label: item.label,
                                    value: item.value
                                };
                            })
                        });
                    });
                }
            }

            let fixedTime: Date | undefined;
            if (metadata.subDataset[0].minDate === metadata.subDataset[0].maxDate) {
                fixedTime = moment.utc(metadata.subDataset[0].minDate).toDate();
            }

            return Promise.resolve({
                id: metadata.datasetId,
                color: this.colorFactory_(),
                type: 'raster',
                coverageExtent: getGeometryExtent(metadata.geometry)!,
                coverageSrs: 'EPSG:4326',
                name: metadata.datasetId,
                fixedTime: fixedTime,
                renderMode: AdamDatasetRenderMode.ClientSide,
                coverages: coverages,
                dimensions: dimensions
            });

        //});
    }

    protected getRoundedMinMax_(minValue: number, maxValue: number) {
        const range = (maxValue - minValue) / 100;

        if (range < 1) {
            const precision = -Math.floor(Math.log10(range));
            minValue = parseFloat(minValue.toFixed(precision));
            maxValue = parseFloat(maxValue.toFixed(precision));
        } else {
            minValue = Math.floor(minValue);
            maxValue = Math.ceil(maxValue);
        }

        return [minValue, maxValue];
    }
}