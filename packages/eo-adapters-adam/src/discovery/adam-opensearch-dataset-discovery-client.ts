import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance, QueryParams, randomColorFactory, getGeometryExtent, isValidExtent } from '@oida/core';
import { AdamWcsCoverageDescriptionClient, AdamWcsCoverageDescription } from './adam-wcs-coverage-description-client';
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


        return this.wcsCoverageDescriptionClient_.getCoverageDetails(metadata.datasetId).then((coverages) => {
            return this.getConfigFromMetadataAndCoverage_(metadata, coverages);
        }).catch(() => {
            return this.getConfigFromMetadataAndCoverage_(metadata, []);
        });
    }

    protected getConfigFromMetadataAndCoverage_(
        metadata: AdamDatasetMetadata, wcsCoverages: AdamWcsCoverageDescription[]
    ): AdamDatasetConfig {

        try {

            //TODO: more than one coverages could be associated to a dataset. Since raster viz currently support
            // only one layer if there are two or more coverages fallback to the 4326 reprojection through
            // eo-geotiff library
            let wcsCoverage = wcsCoverages.length === 1 ? wcsCoverages[0] : undefined;

            let extent: number[];
            let srs: string;

            if (!wcsCoverage) {
                extent = getGeometryExtent(metadata.geometry)!;
                srs = 'EPSG:4326';
                if (!extent || !isValidExtent(extent)) {
                    //no valid extent available in opensearch metadata. use the first available coverage
                    wcsCoverage = wcsCoverages[0];
                    if (!wcsCoverage) {
                        throw new Error('Invalid dataset');
                    } else {
                        extent = wcsCoverage.extent;
                        srs = wcsCoverage.srs;
                    }
                }
            } else {
                extent = wcsCoverage.extent;
                srs = wcsCoverage.srs;
            }

            const dimensions: AdamDatasetDimension[] = [];
            let coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;

            if (metadata.subDataset.length > 1) {
                coverages = {
                id: 'bands',
                name: 'Bands',
                wcsCoverage: wcsCoverage ? wcsCoverage.id : metadata.datasetId,
                presets: [],
                bandGroups: [{
                    id: 'bands',
                    name: 'Bands',
                    bandIndices: metadata.subDataset.map((subdataset, idx) => idx + 1)
                }],
                bands: metadata.subDataset.map((subdataset, idx) => {
                    const minMax = this.getRoundedMinMax_(subdataset.minValue, subdataset.maxValue);
                    return {
                        idx: idx + 1,
                        name: subdataset.name,
                        domain: minMax ? {
                            min: minMax[0],
                            max: minMax[1],
                            noData: subdataset.noDataValue
                        } : undefined,
                        // if data range is not defined set a default range to initialize the colormap object
                        default: minMax ? undefined : {
                            range: {
                                min: 0,
                                max: 10
                            }
                        }
                    };
                })
                };
            } else {
                const variable = metadata.subDataset[0];
                const minMax = this.getRoundedMinMax_(variable.minValue, variable.maxValue);
                coverages = [{
                    id: `${metadata.datasetId}_${variable.name}`,
                    name: variable.name,
                    wcsCoverage: wcsCoverage ? wcsCoverage.id : metadata.datasetId,
                    domain: minMax ? {
                        min: minMax[0],
                        max: minMax[1],
                    } : undefined,
                    // if data range is not defined set a default range to initialize the colormap object
                    default: minMax ? undefined : {
                        range: {
                            min: 0,
                            max: 10
                        }
                    }
                }];

                if (variable.grid && variable.gridNames) {
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

            let minDate: moment.Moment | undefined = moment.utc(metadata.subDataset[0].minDate);
            if (!minDate.isValid()) {
                minDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.start) : undefined;
            }
            let maxDate: moment.Moment | undefined = moment.utc(metadata.subDataset[0].maxDate);
            if (!maxDate.isValid()) {
                maxDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.end) : undefined;
            }

            let fixedTime: Date | undefined;
            if (minDate && minDate?.isSame(maxDate)) {
                fixedTime = moment.utc(minDate).toDate();
            }

            if (!isValidExtent(extent)) {
                throw new Error('Invalid dataset extent');
            }

            // TODO: fix cesium rectangle intersection error when geographic domain
            // is beyond geographic projection limits
            if (srs === 'EPSG:4326') {
                if (extent[0] <= -180) {
                    extent[0] = -180;
                }
                if (extent[2] >= 180) {
                    extent[2] = 180;
                }
                if (extent[1] <= -90) {
                    extent[1] = -90;
                }
                if (extent[3] >= 90) {
                    extent[3] = 90;
                }
            }

            return {
                id: metadata.datasetId,
                color: this.colorFactory_(),
                type: 'raster',
                coverageExtent: extent,
                coverageSrs: srs,
                srsDef: wcsCoverage?.srsDef,
                name: metadata.datasetId,
                fixedTime: fixedTime,
                renderMode: AdamDatasetRenderMode.ClientSide,
                coverages: coverages,
                dimensions: dimensions
            };

        } catch (error) {
            throw new Error('Invalid dataset');
        }
    }

    protected getRoundedMinMax_(minValue: number | undefined, maxValue: number | undefined) {

        if (typeof(minValue) !== 'number' || typeof(maxValue) !== 'number') {
            return undefined;
        }
        const range = (maxValue - minValue) / 100;

        if (range <= 0) {
            return undefined;
        }
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
