import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import { AxiosInstanceWithCancellation } from '@oidajs/core';

import { AdamDatasetConfig } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { AdamSpatialCoverageProvider } from '../get-adam-dataset-spatial-coverage-provider';

import { getAdamRasterMapViewConfig } from './raster';
import { getAdamVerticalProfileViewConfig } from './vertical-profile';
import { getAdamVolumetricMapViewConfig } from './volumetric';

export const getAdamDatasetMapViewConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    spatialCoverageProvider: AdamSpatialCoverageProvider
) => {
    if (datasetConfig.coverageExtent?.srsDef) {
        proj4.defs(datasetConfig.coverageExtent.srs, datasetConfig.coverageExtent.srsDef);
        register(proj4);
    }

    if (datasetConfig.type === 'vertical_profile') {
        return getAdamVerticalProfileViewConfig(axiosInstance, factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'volume') {
        return getAdamVolumetricMapViewConfig(factoryConfig, datasetConfig);
    } else {
        return getAdamRasterMapViewConfig(axiosInstance, factoryConfig, datasetConfig, spatialCoverageProvider);
    }
};
