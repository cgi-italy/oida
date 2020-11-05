import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transformExtent } from 'ol/proj';
import { fromArrayBuffer } from 'geotiff';

import { AxiosInstanceWithCancellation } from '@oida/core';
import { RasterMapViz, DatasetViz } from '@oida/eo-mobx';

import { AdamDatasetConfig } from './adam-dataset-config';
import { AdamDatasetFactoryConfig } from './get-adam-dataset-factory';
import { AdamServiceParamsSerializer } from './utils/adam-service-params-serializer';
import { getWcsTimeFilterSubset, getCoverageWcsParams } from './utils';

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

    return (mapView: DatasetViz<any>, keepDatasetSrs?: boolean) => {

        if (mapView instanceof RasterMapViz) {
            let wcsParams: any = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                format: 'image/tiff',
                size: '(32,32)'
            };

            const subsets: string[] = [];

            let timeSubset = getWcsTimeFilterSubset(mapView.dataset.selectedTime);
            if (timeSubset && !datasetConfig.isTimeless) {
                subsets.push(timeSubset);
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
                    subset: subsets
                },
                paramsSerializer: AdamServiceParamsSerializer,
                responseType: 'arraybuffer'
            }).then((response) => {
                return fromArrayBuffer(response.data).then((tiff) => {
                    return tiff.getImage().then((image) => {
                        let extent = image.getBoundingBox();
                        if (!keepDatasetSrs && datasetConfig.coverageSrs !== 'EPSG:4326') {
                            extent = transformExtent(extent, datasetConfig.coverageSrs, 'EPSG:4326');
                        }
                        if (datasetConfig.requestExtentOffset) {
                            extent[0] -= datasetConfig.requestExtentOffset[0];
                            extent[2] -= datasetConfig.requestExtentOffset[0];
                            extent[1] -= datasetConfig.requestExtentOffset[1];
                            extent[3] -= datasetConfig.requestExtentOffset[1];
                        }
                        return extent;
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
    };

};
