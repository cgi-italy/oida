import moment from 'moment';

import {
    AxiosInstanceWithCancellation,
    createAxiosInstance,
    QueryParams,
    getGeometryExtent,
    isValidExtent,
    BOOLEAN_FIELD_ID,
    STRING_FIELD_ID
} from '@oidajs/core';

import { AdamWcsCoverageDescriptionClient, AdamWcsCoverageDescription } from './adam-wcs-coverage-description-client';
import {
    AdamDatasetConfig,
    AdamDatasetDimension,
    AdamDatasetSingleBandCoverage,
    AdamDatasetMultiBandCoverage,
    AdamDatasetRenderMode,
    AdamDatasetCoverageBand
} from '../adam-dataset-config';
import {
    AdamOpenSearchClient,
    AdamOpensearchDatasetCustomGridSpec,
    AdamOpensearchDatasetMetadata,
    AdamOpensearchDatasetMetadataSubdataset,
    AdamOpensearchMetadataModelVersion,
    AdamOpensearchProductMetadata
} from '../common';

export type AdamOpensearchDatasetDiscoveryClientConfig = {
    serviceUrl: string;
    wcsUrl: string;
    additionalDatasetConfig?: Record<string, Partial<AdamDatasetConfig>>;
    metadataModelVersion?: AdamOpensearchMetadataModelVersion;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class AdamOpensearchDatasetDiscoveryClient {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected openSearchClient_: AdamOpenSearchClient;
    protected wcsCoverageDescriptionClient_: AdamWcsCoverageDescriptionClient;
    protected additionalDatasetConfig_: Record<string, Partial<AdamDatasetConfig> & { disabled?: boolean }>;

    constructor(config: AdamOpensearchDatasetDiscoveryClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.openSearchClient_ = new AdamOpenSearchClient({
            serviceUrl: config.serviceUrl,
            axiosInstance: this.axiosInstance_,
            metadataModelVersion: config.metadataModelVersion
        });
        this.wcsCoverageDescriptionClient_ = new AdamWcsCoverageDescriptionClient({
            wcsUrl: config.wcsUrl,
            axiosInstance: this.axiosInstance_
        });
        this.additionalDatasetConfig_ = config.additionalDatasetConfig || {};
    }

    searchDatasets(queryParams: QueryParams) {
        const filters = queryParams.filters?.slice() || [];

        filters.push({
            key: 'geolocated',
            type: BOOLEAN_FIELD_ID,
            value: true
        });

        return this.openSearchClient_
            .getDatasets({
                ...queryParams,
                filters: filters
            })
            .then((response) => {
                return {
                    ...response,
                    features: response.features.filter((feature) => {
                        return !this.additionalDatasetConfig_[feature.datasetId]?.disabled;
                    })
                };
            });
    }

    getAdamDatasetConfig(metadata: AdamOpensearchDatasetMetadata): Promise<AdamDatasetConfig> {
        return this.wcsCoverageDescriptionClient_
            .getCoverageDetails(metadata.datasetId)
            .then((coverages) => {
                return this.getRecordForDataset_(metadata.datasetId)
                    .then((record) => {
                        return this.getConfigFromMetadataAndCoverage_(metadata, coverages, record);
                    })
                    .catch(() => {
                        return this.getConfigFromMetadataAndCoverage_(metadata, coverages);
                    });
            })
            .catch(() => {
                return this.getRecordForDataset_(metadata.datasetId)
                    .then((record) => {
                        return this.getConfigFromMetadataAndCoverage_(metadata, [], record);
                    })
                    .catch(() => {
                        return this.getConfigFromMetadataAndCoverage_(metadata, []);
                    });
            });
    }

    protected getRecordForDataset_(datasetId: string) {
        return this.openSearchClient_
            .searchProducts({
                paging: {
                    pageSize: 1,
                    offset: 0,
                    page: 0
                },
                filters: [
                    {
                        key: 'datasetId',
                        type: STRING_FIELD_ID,
                        value: datasetId
                    }
                ]
            })
            .then((searchResponse) => {
                return searchResponse.features[0];
            });
    }

    protected getConfigFromMetadataAndCoverage_(
        metadata: AdamOpensearchDatasetMetadata,
        wcsCoverages: AdamWcsCoverageDescription[],
        sampleRecord?: AdamOpensearchProductMetadata
    ): Promise<AdamDatasetConfig> {
        try {
            //TODO: more than one coverages could be associated to a dataset. Since raster viz currently support
            // only one layer if there are two or more coverages in different spatial references we init the layer
            // with 4326 projection and let eo-geotiff library handle the reprojection (not accurate)
            let wcsCoverage = wcsCoverages.length === 1 ? wcsCoverages[0] : undefined;

            let extent:
                | {
                      bbox: number[];
                      srs: string;
                      srsDef?: string;
                  }
                | undefined;

            if (!wcsCoverage) {
                if (wcsCoverages.length) {
                    extent = {
                        srs: wcsCoverages[0].srs,
                        srsDef: wcsCoverages[0].srsDef,
                        bbox: wcsCoverages[0].extent
                    };

                    // if all coverages share the same srs compute the combined extent and init
                    // the layer with the native coverages projection
                    for (let i = 0; i < wcsCoverages.length; ++i) {
                        if (wcsCoverages[i].srs !== extent.srs) {
                            extent = undefined;
                            break;
                        } else {
                            const coverageExtent = wcsCoverages[i].extent;
                            extent.bbox = [
                                Math.min(extent.bbox[0], coverageExtent[0]),
                                Math.min(extent.bbox[1], coverageExtent[1]),
                                Math.max(extent.bbox[2], coverageExtent[2]),
                                Math.max(extent.bbox[3], coverageExtent[3])
                            ];
                        }
                    }
                    //otherwise fallback to the 4326 reprojection through eo-geotiff library (not accurate)
                    if (!extent) {
                        extent = {
                            srs: 'EPSG:4326',
                            srsDef: undefined,
                            bbox: getGeometryExtent(metadata.geometry)!
                        };
                    }
                    if (!isValidExtent(extent.bbox)) {
                        //no valid extent available in opensearch metadata. use the first available coverage
                        wcsCoverage = wcsCoverages[0];
                        extent = {
                            bbox: wcsCoverage.extent,
                            srs: wcsCoverage.srs,
                            srsDef: wcsCoverage.srsDef
                        };
                    }
                } else {
                    extent = undefined;
                }
            } else {
                extent = {
                    bbox: wcsCoverage.extent,
                    srs: wcsCoverage.srs,
                    srsDef: wcsCoverage.srsDef
                };
            }

            let coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;

            let subdatasets = metadata.subDataset;
            if (!Array.isArray(subdatasets)) {
                subdatasets = Object.entries(metadata.subDataset).map(([id, subdataset]) => {
                    return {
                        ...subdataset,
                        subDatasetId: id,
                        name: id
                    };
                });
            }
            let subsetDimension: AdamDatasetDimension | undefined;
            const defaultViewMode = subdatasets[0].defaultViewMode || [];
            let numBands = wcsCoverages[0]?.numBands;
            if (!numBands) {
                numBands = parseInt(sampleRecord?.single_multiband || sampleRecord?.metadata?.single_multiband || '0');
            }
            if (!numBands) {
                numBands = defaultViewMode.length || 1;
            }

            if (numBands > 1) {
                subsetDimension = {
                    id: 'subdataset',
                    name: 'SubDataset',
                    wcsSubset: {
                        id: 'subdataset'
                    },
                    domain: {
                        values: subdatasets.map((subdataset) => {
                            return {
                                value: subdataset.subDatasetId,
                                name: subdataset.name
                            };
                        })
                    }
                };

                // Not reliable. Disable it for now

                // if (wcsCoverages[0].isTrueColor) {
                //     coverages = {
                //         id: `tci`,
                //         name: 'True color image',
                //         wcsCoverage: metadata.datasetId,
                //         isTrueColor: true,
                //         bands: [],
                //         bandGroups: [],
                //         presets: []
                //     };
                // } else {

                let minValue = Number.MAX_VALUE;
                let maxValue = -Number.MAX_VALUE;
                subdatasets.forEach((subdataset) => {
                    minValue = Math.min(subdataset.minValue, minValue);
                    maxValue = Math.max(subdataset.maxValue, maxValue);
                });

                const bands: AdamDatasetCoverageBand[] = [];
                for (let i = 0; i < numBands; ++i) {
                    bands.push({
                        idx: i + 1,
                        name: `B${i + 1}`,
                        domain: {
                            min: minValue,
                            max: maxValue
                        }
                    });
                }
                coverages = {
                    id: 'bands',
                    name: 'Bands',
                    wcsCoverage: metadata.datasetId,
                    presets:
                        defaultViewMode.length === 3
                            ? [
                                  {
                                      id: 'default',
                                      name: 'Default',
                                      bands: defaultViewMode.map((value, idx) => {
                                          // default view mode use the format band1, band2...
                                          const match = value.match(/[0-9]+/);
                                          if (match) {
                                              return parseInt(match[0]);
                                          } else {
                                              return idx;
                                          }
                                      })
                                  }
                              ]
                            : [],
                    bandGroups: [
                        {
                            id: 'bands',
                            name: 'Bands',
                            bandIndices: bands.map((band, idx) => idx)
                        }
                    ],
                    bands: bands
                };
                // }
            } else {
                coverages = subdatasets.map((variable) => {
                    const minMax = this.getRoundedMinMax_(variable.minValue, variable.maxValue);
                    return {
                        id: variable.name,
                        name: variable.name,
                        wcsCoverage: metadata.datasetId,
                        subdataset: variable.subDatasetId,
                        domain: minMax
                            ? {
                                  min: minMax[0],
                                  max: minMax[1]
                              }
                            : undefined,
                        // if data range is not defined set a default range to initialize the colormap object
                        default: minMax
                            ? undefined
                            : {
                                  range: {
                                      min: 0,
                                      max: 10
                                  }
                              }
                    };
                });
            }

            let minDate: moment.Moment | undefined = moment.utc(metadata.minDate);
            if (!minDate.isValid()) {
                minDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.start) : undefined;
            }
            let maxDate: moment.Moment | undefined = moment.utc(metadata.maxDate);
            if (!maxDate.isValid()) {
                maxDate = wcsCoverages.length === 1 ? moment.utc(wcsCoverages[0].time.end) : undefined;
            }

            let fixedTime: Date | boolean = false;
            if (minDate && minDate?.isSame(maxDate)) {
                fixedTime = minDate.toDate();
            }

            if (extent && !isValidExtent(extent.bbox)) {
                return Promise.reject(new Error('Invalid dataset extent'));
            }

            // TODO: fix cesium rectangle intersection error when geographic domain
            // is beyond geographic projection limits
            if (extent && extent.srs === 'EPSG:4326') {
                if (extent.bbox[0] <= -180) {
                    extent.bbox[0] = -180;
                }
                if (extent.bbox[2] >= 180) {
                    extent.bbox[2] = 180;
                }
                if (extent.bbox[1] <= -90) {
                    extent.bbox[1] = -90;
                }
                if (extent.bbox[3] >= 90) {
                    extent.bbox[3] = 90;
                }
            }

            return this.getDatasetDimensionsFromSubdatasets_(subdatasets, metadata.datasetSpecification).then((dimensions) => {
                //disable time navigation for campaign data
                if (dimensions.length && (dimensions[0].id === 'SceneType' || dimensions[0].id === 'image')) {
                    fixedTime = true;
                }

                if (subsetDimension) {
                    dimensions.push(subsetDimension);
                }

                return {
                    type: 'raster',
                    id: metadata.datasetId,
                    coverageExtent: extent,
                    name: metadata.title || metadata.datasetId,
                    fixedTime: fixedTime,
                    renderMode: AdamDatasetRenderMode.ClientSide,
                    coverages: coverages,
                    dimensions: dimensions,
                    timeRange: !fixedTime
                        ? {
                              start: minDate!.toDate(),
                              end: maxDate!.toDate()
                          }
                        : undefined,
                    ...this.additionalDatasetConfig_[metadata.datasetId]
                };
            });
        } catch (error) {
            return Promise.reject(new Error('Invalid dataset'));
        }
    }

    protected getRoundedMinMax_(minValue: number | undefined, maxValue: number | undefined) {
        if (typeof minValue !== 'number' || typeof maxValue !== 'number') {
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
        subdatasets: AdamOpensearchDatasetMetadataSubdataset[],
        gridDetailsUrl: string
    ): Promise<AdamDatasetDimension[]> {
        // the assumption is that all subdatasets have the same grid configuration
        const gridNames = subdatasets[0].gridNames;

        if (!gridNames?.length) {
            return Promise.resolve([]);
        }
        if (gridNames[0].id === 'SceneType') {
            return this.axiosInstance_
                .cancelableRequest<AdamOpensearchDatasetCustomGridSpec>({
                    url: gridDetailsUrl
                })
                .then((response) => {
                    const gridSpec = response.data;

                    const sceneValuesMap: Record<
                        string,
                        {
                            scene: number;
                            subRegion: number;
                        }
                    > = {};

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
                                    const subdataset = subdatasets.find((subdataset) => subdataset.subDatasetId === subdatasetId);
                                    const subdatasetGridItem =
                                        subdataset?.gridNames?.find((gridItem) => gridItem.id === dimensionId) || gridItem;

                                    const sceneValues: Array<{ label: string; value: number }> = [];

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
                                        } else {
                                            const value = sceneValuesMap[item.value];
                                            if (value !== undefined && (subRegionId === undefined || value.subRegion === subRegionId)) {
                                                sceneValues.push({
                                                    label: `${item.value} (${sceneName})`,
                                                    value: value.scene
                                                });
                                            }
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
                                    const subdataset = subdatasets.find((subdataset) => subdataset.subDatasetId === subdatasetId);
                                    const subdatasetGridItem =
                                        subdataset?.gridNames?.find((gridItem) => gridItem.id === dimensionId) || gridItem;
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
            if (subdatasets[0].gridType === 'Custom') {
                return Promise.resolve(
                    gridNames.map((gridItem, idx) => {
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
                    })
                );
            } else {
                return Promise.resolve([]);
            }
        }
    }
}
