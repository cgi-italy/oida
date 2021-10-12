import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance, QueryParams, getGeometryExtent, isValidExtent } from '@oida/core';
import { AdamWcsCoverageDescriptionClient, AdamWcsCoverageDescription } from './adam-wcs-coverage-description-client';
import { AdamDatasetConfig, AdamDatasetDimension, AdamDatasetSingleBandCoverage, AdamDatasetMultiBandCoverage, AdamDatasetRenderMode } from '../adam-dataset-config';

export type AdamDatasetMetadataGridName = {
    id: string;
    label: string;
    values: Array<{
        label: string;
        value: string | string[];
    }>;
};

export type AdamDatasetCustomGridSpec = {
    SubRegion: Record<string, {
        value: string,
        scenes: Array<{
            scene_type: string,
            scene_type_values: Array<Record<string, number>>
        }>
    }>,
    Product: Record<string, string>
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
    gridType?: string;
    gridNames?: AdamDatasetMetadataGridName[];
};

export type AdamDatasetMetadata = {
    datasetId: string;
    title: string;
    datasetType: 'Raster' | 'Vertical' | 'Tomo';
    geometry: GeoJSON.Geometry;
    subDataset: AdamDatasetMetadataSubdataset[];
    description: string;
    dataset_specification: string;
    defaultViewMode?: string[];
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

    constructor(config: AdamOpensearchDatasetDiscoveryClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.url_ = config.serviceUrl;
        this.wcsCoverageDescriptionClient_ = new AdamWcsCoverageDescriptionClient({
            wcsUrl: config.wcsUrl,
            axiosInstance: this.axiosInstance_
        });
    }

    searchDatasets(queryParams: QueryParams) {

        const params: AdamDatasetDiscoveryRequest = {};

        // currently the opensearch endpoint doesn't support pagination
        // TODO: enable this once available
        if (queryParams.paging) {
            //params.maxRecords = queryParams.paging.pageSize;
            //params.startIndex = queryParams.paging.offset;
        }

        return this.axiosInstance_.request<AdamDatasetDiscoveryResponse>({
            url: `${this.url_}/datasets`,
            params: {
                ...params,
                geolocated: true
            }
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
    ): Promise<AdamDatasetConfig> {

        try {

            //TODO: more than one coverages could be associated to a dataset. Since raster viz currently support
            // only one layer if there are two or more coverages in different spatial references we init the layer
            // with 4326 projection and let eo-geotiff library handle the reprojection (not accurate)
            let wcsCoverage = wcsCoverages.length === 1 ? wcsCoverages[0] : undefined;

            let extent: number[] | undefined;
            let srs: string;
            let srsDef: string | undefined;

            if (!wcsCoverage) {
                srs = wcsCoverages[0].srs;
                srsDef = wcsCoverages[0].srsDef;
                extent = wcsCoverages[0].extent;

                // if all coverages share the same srs compute the combined extent and init
                // the layer with the native coverages projection
                for (let i = 0; i < wcsCoverages.length; ++i) {
                    if (wcsCoverages[i].srs !== srs) {
                        extent = undefined;
                        break;
                    } else {
                        const coverageExtent = wcsCoverages[i].extent;
                        extent = [
                            Math.min(extent[0], coverageExtent[0]),
                            Math.min(extent[1], coverageExtent[1]),
                            Math.max(extent[2], coverageExtent[2]),
                            Math.max(extent[3], coverageExtent[3]),
                        ];
                    }
                }
                //otherwise fallback to the 4326 reprojection through eo-geotiff library (not accurate)
                if (!extent) {
                    srs = 'EPSG:4326';
                    srsDef = undefined;
                    extent = getGeometryExtent(metadata.geometry)!;
                }
                if (!extent || !isValidExtent(extent)) {
                    //no valid extent available in opensearch metadata. use the first available coverage
                    wcsCoverage = wcsCoverages[0];
                    if (!wcsCoverage) {
                        return Promise.reject(new Error('Invalid dataset'));
                    } else {
                        extent = wcsCoverage.extent;
                        srs = wcsCoverage.srs;
                        srsDef = wcsCoverage.srsDef;
                    }
                }
            } else {
                extent = wcsCoverage.extent;
                srs = wcsCoverage.srs;
                srsDef = wcsCoverage.srsDef;
            }

            let coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;

            if ((metadata.defaultViewMode || []).length > 1) {

                //check for true color dataset
                if (metadata.subDataset.length === 3 && metadata.subDataset.every((subdataset) => {
                    return subdataset.minValue === 0 && subdataset.maxValue === 255;
                })) {
                    coverages = {
                        id: `tci`,
                        name: 'True color image',
                        wcsCoverage: metadata.datasetId,
                        isTrueColor: true,
                        bands: [],
                        bandGroups: [],
                        presets: []
                    };
                } else {
                    coverages = {
                        id: 'bands',
                        name: 'Bands',
                        wcsCoverage: metadata.datasetId,
                        presets: [],
                        bandGroups: [{
                            id: 'bands',
                            name: 'Bands',
                            bandIndices: metadata.subDataset.map((subdataset, idx) => idx)
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
                }
            } else {
                coverages = metadata.subDataset.map((variable) => {
                    const minMax = this.getRoundedMinMax_(variable.minValue, variable.maxValue);
                    return {
                        id: `${variable.name}`,
                        name: variable.name,
                        wcsCoverage: metadata.datasetId,
                        subdataset: variable.subDatasetId,
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
                    };
                });

            }

            let minDate: moment.Moment | undefined = moment.utc(metadata.subDataset[0].minDate);
            if (!minDate.isValid()) {
                minDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.start) : undefined;
            }
            let maxDate: moment.Moment | undefined = moment.utc(metadata.subDataset[0].maxDate);
            if (!maxDate.isValid()) {
                maxDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.end) : undefined;
            }

            let timeless = false;
            if (minDate && minDate?.isSame(maxDate)) {
                timeless = true;
            }

            if (!isValidExtent(extent)) {
                return Promise.reject(new Error('Invalid dataset extent'));
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

            return this.getDatasetDimensionsFromSubdatasets_(
                metadata.subDataset, metadata.dataset_specification
            ).then((dimensions) => {

                //disable time navigation for mission data
                if (dimensions.length && dimensions[0].id === 'SceneType') {
                    timeless = true;
                }

                return {
                    type: 'raster',
                    coverageExtent: extent!,
                    coverageSrs: srs,
                    srsDef: srsDef,
                    name: metadata.datasetId,
                    timeless: timeless,
                    renderMode: AdamDatasetRenderMode.ClientSide,
                    coverages: coverages,
                    dimensions: dimensions
                };
            });

        } catch (error) {
            return Promise.reject(new Error('Invalid dataset'));
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

    protected getDatasetDimensionsFromSubdatasets_(
        subdatasets: AdamDatasetMetadataSubdataset[], gridDetailsUrl: string
    ): Promise<AdamDatasetDimension[]> {

        // the assumption is that all subdatasets have the same grid configuration
        const gridNames = subdatasets[0].gridNames;

        if (!gridNames?.length) {
            return Promise.resolve([]);
        }
        if (gridNames[0].id === 'SceneType') {
            return this.axiosInstance_.cancelableRequest<AdamDatasetCustomGridSpec>({
                url: gridDetailsUrl
            }).then((response) => {
                const gridSpec = response.data;

                const sceneValuesMap: Record<string, {
                    scene: number,
                    subRegion: number
                }> = {};

                Object.keys(gridSpec.SubRegion).forEach((key) => {
                    const subRegionValue = parseInt(gridSpec.SubRegion[key].value);
                    gridSpec.SubRegion[key].scenes.forEach((scene) => {
                        scene.scene_type_values.forEach((sceneTypeValue) => {
                            Object.keys(sceneTypeValue).forEach((key) => {
                                sceneValuesMap[key] = {
                                    scene: sceneTypeValue[key],
                                    subRegion: subRegionValue
                                };
                            });
                        });
                    });
                });

                const dimensions: AdamDatasetDimension[] = [];
                gridNames.forEach((gridItem, idx) => {
                    const dimensionId = gridItem.id;
                    if (gridItem.id === 'SceneType') {
                        dimensions.push({
                            id: dimensionId,
                            name: gridItem.label,
                            wcsSubset: {
                                id: 'gfix',
                                idx: idx
                            },
                            domain: (filters) => {
                                const subRegionId: number = filters?.dimensionValues?.get('SubRegion');

                                const subdatasetId = filters?.variable;
                                const subdataset = subdatasets.find(subdataset => subdataset.subDatasetId === subdatasetId);
                                const subdatasetGridItem = subdataset?.gridNames?.find(gridItem => gridItem.id === dimensionId) || gridItem;

                                const sceneValues: Array<{label: string, value: number}> = [];

                                subdatasetGridItem.values.forEach((item) => {
                                    const sceneName = item.label;
                                    if (Array.isArray(item.value)) {
                                        item.value.forEach((label) => {
                                            const value = sceneValuesMap[label];
                                            if (value !== undefined && (subRegionId === undefined || value.subRegion === subRegionId)) {
                                                sceneValues.push({
                                                    label: `${label} (${sceneName})`,
                                                    value: value.scene
                                                });
                                            }
                                        });
                                    }
                                });

                                return Promise.resolve({
                                    values: sceneValues.sort((item1, item2) => item1.value - item2.value)
                                });
                            }
                        });
                    } else {
                        dimensions.push({
                            id: gridItem.id,
                            name: gridItem.label,
                            wcsSubset: {
                                id: 'gfix',
                                idx: idx
                            },
                            domain: (filters) => {
                                const subdatasetId = filters?.variable;
                                const subdataset = subdatasets.find(subdataset => subdataset.subDatasetId === subdatasetId);
                                const subdatasetGridItem = subdataset?.gridNames?.find(gridItem => gridItem.id === dimensionId) || gridItem;
                                return Promise.resolve({
                                    values: subdatasetGridItem.values.map((item) => {
                                        const value = Array.isArray(item.value) ? item.value[0] : item.value;
                                        return {
                                            label: item.label,
                                            value: parseInt(value)
                                        };
                                    })
                                });
                            }
                        });
                    }
                });
                return dimensions;
            });
        } else {
            return Promise.resolve(gridNames.map((gridItem, idx) => {
                return {
                    id: gridItem.id,
                    name: gridItem.label,
                    wcsSubset: {
                        id: 'gfix',
                        idx: idx
                    },
                    domain: {
                        values: gridItem.values.map((item) => {
                            const value = Array.isArray(item.value) ? item.value[0] : item.value;
                            return {
                                label: item.label,
                                value: parseInt(value)
                            };
                        })
                    }
                };
            }));
        }
    }
}
