import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transformExtent } from 'ol/proj';
import { getIntersection } from 'ol/extent';
import { fromArrayBuffer } from 'geotiff';

import { AxiosInstanceWithCancellation, EpsgIoDefinitionProvider } from '@oidajs/core';
import { RasterMapViz, DatasetViz } from '@oidajs/eo-mobx';

import { AdamDatasetConfig } from './adam-dataset-config';
import { AdamDatasetFactoryConfig } from './get-adam-dataset-factory';
import { AdamServiceParamsSerializer } from './utils/adam-service-params-serializer';
import { getWcsTimeFilterSubset, getCoverageWcsParams } from './utils';

export type AdamSpatialCoverageProvider = (
    mapView: DatasetViz<any>,
    keepDatasetSrs?: boolean
) => Promise<
    | {
          bbox: number[];
          srs: string;
      }
    | undefined
>;

//TODO: This utils were extracted from the eo-geotiff library for lack of time
// Refactor the code to use the GeotiffLoader class instead

const srsDefProvider = new EpsgIoDefinitionProvider();

const getGeotiffSrs = (image) => {
    const imageSrs: number = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;
    if (imageSrs) {
        if (imageSrs < 32767) {
            return `EPSG:${imageSrs}`;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};

const registerSrs = (code: string) => {
    if (!proj4.defs(code)) {
        return srsDefProvider
            .getSrsDefinition(code)
            .then((srsDef) => {
                proj4.defs(code, srsDef);
            })
            .then(() => {
                return true;
            });
    } else {
        return Promise.resolve(false);
    }
};

const transformExtent = (extent: number[], sourceSrs: string, destSrs: string): number[] => {
    const ll = proj4(sourceSrs, destSrs, [extent[0], extent[1]]);
    const ur = proj4(sourceSrs, destSrs, [extent[2], extent[3]]);

    return [...ll, ...ur];
};

const getGeotiffExtent = (image) => {
    const imageExtent: number[] = image.getBoundingBox();
    const imageSrs = getGeotiffSrs(image);
    if (imageSrs) {
        return registerSrs(imageSrs).then(() => {
            return {
                bbox: imageExtent,
                srs: imageSrs
            };
        });
    } else {
        return Promise.resolve(undefined);
    }
};

export const getAdamDatasetSpatialCoverageProvider = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {
    if (datasetConfig.coverageExtent?.srsDef) {
        proj4.defs(datasetConfig.coverageExtent.srs, datasetConfig.coverageExtent.srsDef);
        register(proj4);
    }

    let geogCoverageExtent: { bbox: number[]; srs: string } | undefined;
    if (datasetConfig.coverageExtent && datasetConfig.coverageExtent.srs !== 'EPSG:4326') {
        geogCoverageExtent = {
            bbox: transformExtent(datasetConfig.coverageExtent.bbox, datasetConfig.coverageExtent.srs, 'EPSG:4326'),
            srs: 'EPSG:4326'
        };
    }

    return ((mapView: DatasetViz<any>, keepDatasetSrs?: boolean) => {
        if (mapView instanceof RasterMapViz) {
            if (datasetConfig.minZoomLevel || datasetConfig.aoiRequired) {
                //coarse zoom levels are probably too slow to retrieve. use extent from coverage definition
                return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
            }

            const wcsParams: any = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                format: 'image/tiff',
                size: '(32,32)'
            };

            const subsets: string[] = [];

            if (!datasetConfig.fixedTime) {
                const timeSubset = getWcsTimeFilterSubset(mapView.dataset.toi);
                if (timeSubset) {
                    subsets.push(timeSubset);
                }
            }

            const wcsCoverage = getCoverageWcsParams(datasetConfig, mapView.dimensions, mapView.bandMode);
            if (!wcsCoverage) {
                return Promise.resolve(undefined);
            }

            // ignore the mapview band combination and always use one band to get smaller tiff response
            if (wcsCoverage.bandSubset) {
                subsets.push(`band(1)`);
            }
            subsets.push(...wcsCoverage.dimensionSubsets);

            return axiosInstance
                .cancelableRequest({
                    url: factoryConfig.wcsServiceUrl,
                    params: {
                        ...wcsParams,
                        coverageId: wcsCoverage.coverageId,
                        subdataset: wcsCoverage.subdataset,
                        subset: subsets
                    },
                    paramsSerializer: AdamServiceParamsSerializer,
                    responseType: 'arraybuffer'
                })
                .then((response) => {
                    return fromArrayBuffer(response.data)
                        .then((tiff) => {
                            return tiff
                                .getImage()
                                .then((image) => {
                                    return getGeotiffExtent(image).then((extent) => {
                                        if (!keepDatasetSrs && extent.srs !== 'EPSG:4326') {
                                            extent.bbox = transformExtent(extent.bbox, extent.srs, 'EPSG:4326');
                                            extent.srs = 'EPSG:4326';
                                            if (geogCoverageExtent) {
                                                extent.bbox = getIntersection(extent.bbox, geogCoverageExtent.bbox);
                                            }
                                        } else {
                                            if (datasetConfig.coverageExtent && datasetConfig.coverageExtent.srs === extent.srs) {
                                                extent.bbox = getIntersection(extent.bbox, datasetConfig.coverageExtent.bbox);
                                            }
                                        }

                                        if (datasetConfig.requestExtentOffset) {
                                            extent.bbox[0] -= datasetConfig.requestExtentOffset[0];
                                            extent.bbox[2] -= datasetConfig.requestExtentOffset[0];
                                            extent.bbox[1] -= datasetConfig.requestExtentOffset[1];
                                            extent.bbox[3] -= datasetConfig.requestExtentOffset[1];
                                        }
                                        return extent;
                                    });
                                })
                                .catch((error) => {
                                    return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
                                });
                        })
                        .catch((error) => {
                            return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
                        });
                })
                .catch(() => {
                    return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
                });
        } else {
            return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
        }
    }) as AdamSpatialCoverageProvider;
};
