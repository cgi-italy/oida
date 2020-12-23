import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import { AxiosInstanceWithCancellation } from '@oida/core';

import { AdamDatasetConfig } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';

import { getAdamRasterMapViewConfig } from './raster';
import { getAdamVerticalProfileViewConfig } from './vertical-profile';
import { getAdamVolumetricMapViewConfig } from './volumetric';

export const getAdamDatasetMapViewConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {

    if (datasetConfig.srsDef) {
        proj4.defs(datasetConfig.coverageSrs, datasetConfig.srsDef);
        register(proj4);
    }

    if (datasetConfig.type === 'vertical_profile') {
        return getAdamVerticalProfileViewConfig(axiosInstance, factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'volume') {
        return getAdamVolumetricMapViewConfig(factoryConfig, datasetConfig);
    } else {
        return getAdamRasterMapViewConfig(axiosInstance, factoryConfig, datasetConfig);
    }

};
