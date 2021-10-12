import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transformExtent } from 'ol/proj';
import { getIntersection } from 'ol/extent';
import { fromArrayBuffer } from 'geotiff';

import { AxiosInstanceWithCancellation, EpsgIoDefinitionProvider } from '@oida/core';
import { RasterMapViz, DatasetViz } from '@oida/eo-mobx';

import { AdamDatasetConfig } from './adam-dataset-config';
import { AdamDatasetFactoryConfig } from './get-adam-dataset-factory';
import { AdamServiceParamsSerializer } from './utils/adam-service-params-serializer';
import { getWcsTimeFilterSubset, getCoverageWcsParams } from './utils';

export type AdamSpatialCoverageProvider = (mapView: DatasetViz<any>, keepDatasetSrs?: boolean) => Promise<number[] | undefined>;

//TODO: This utils were extracted from the eo-geotiff library for lack of time
// Refactor the code to use the GeotiffLoader class instead

const srsDefProvider = new EpsgIoDefinitionProvider();

const getGeotiffSrs = (image) => {
    const imageSrs: number = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;
    if (imageSrs) {
        if (imageSrs < 32767) {
            return  `EPSG:${imageSrs}`;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};

const registerSrs = (code: string) => {
    if (!proj4.defs(code)) {
        return srsDefProvider.getSrsDefinition(code).then((srsDef) => {
            proj4.defs(code, srsDef);
        }).then(() => {
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

const getGeotiffExtent = (image, outputSrs?: string) => {
    let imageExtent: number[] = image.getBoundingBox();
    if (outputSrs) {
        const imageSrs = getGeotiffSrs(image);
        if (imageSrs && imageSrs !== outputSrs) {
            return registerSrs(imageSrs).then(() => {
                const extent = transformExtent(image.getBoundingBox(), imageSrs, outputSrs);
                return extent;
            });
        }
    }
    return Promise.resolve(imageExtent);
};


export const getAdamDatasetSpatialCoverageProvider = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {

    if (datasetConfig.srsDef) {
        proj4.defs(datasetConfig.coverageSrs, datasetConfig.srsDef);
        register(proj4);
    }

    let geogCoverageExtent = datasetConfig.coverageExtent;
    if (datasetConfig.coverageSrs !== 'EPSG:4326') {
        geogCoverageExtent = transformExtent(geogCoverageExtent, datasetConfig.coverageSrs, 'EPSG:4326');
    }

    return ((mapView: DatasetViz<any>, keepDatasetSrs?: boolean) => {

        if (mapView instanceof RasterMapViz) {
            let wcsParams: any = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                format: 'image/tiff',
                size: '(32,32)'
            };

            const subsets: string[] = [];

            if (!datasetConfig.timeless) {
                let timeSubset = getWcsTimeFilterSubset(mapView.dataset.toi);
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


            return axiosInstance.cancelableRequest({
                url: factoryConfig.wcsServiceUrl,
                params: {
                    ...wcsParams,
                    coverageId: wcsCoverage.coverageId,
                    subdataset: wcsCoverage.subdataset,
                    subset: subsets
                },
                paramsSerializer: AdamServiceParamsSerializer,
                responseType: 'arraybuffer'
            }).then((response) => {
                return fromArrayBuffer(response.data).then((tiff) => {
                    return tiff.getImage().then((image) => {
                        return getGeotiffExtent(image, datasetConfig.coverageSrs).then((extent) => {
                            if (!keepDatasetSrs && datasetConfig.coverageSrs !== 'EPSG:4326') {
                                extent = transformExtent(extent, datasetConfig.coverageSrs, 'EPSG:4326');
                                extent = getIntersection(extent, geogCoverageExtent);
                            } else {
                                extent = getIntersection(extent, datasetConfig.coverageExtent);
                            }

                            if (datasetConfig.requestExtentOffset) {
                                extent[0] -= datasetConfig.requestExtentOffset[0];
                                extent[2] -= datasetConfig.requestExtentOffset[0];
                                extent[1] -= datasetConfig.requestExtentOffset[1];
                                extent[3] -= datasetConfig.requestExtentOffset[1];
                            }
                            return extent;
                        });
                    }).catch((error) => {
                        return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
                    });
                }).catch((error) => {
                    return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
                });
            }).catch(() => {
                return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
            });
        } else {
            return Promise.resolve(keepDatasetSrs ? datasetConfig.coverageExtent : geogCoverageExtent);
        }
    }) as AdamSpatialCoverageProvider;

};
