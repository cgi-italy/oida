import { AxiosInstanceWithCancellation } from '@oidajs/core';

import { AdamDatasetConfig } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { AdamSpatialCoverageProvider } from '../get-adam-dataset-spatial-coverage-provider';

import { getAdamRasterMapViewConfig } from './raster';
import { getAdamVerticalProfileViewConfig } from './vertical-profile';
import { getAdamVolumetricMapViewConfig } from './volumetric';
import { getAdamVectorMapViewConfig } from './vector/get-adam-vector-map-view-config';
import { AdamOpenSearchClient } from '../common/adam-opensearch-client';

export const getAdamDatasetMapViewConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    spatialCoverageProvider: AdamSpatialCoverageProvider,
    openSearchClient?: AdamOpenSearchClient
) => {
    if (datasetConfig.type === 'vertical_profile') {
        return getAdamVerticalProfileViewConfig(axiosInstance, factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'volume') {
        return getAdamVolumetricMapViewConfig(factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'raster') {
        return getAdamRasterMapViewConfig(axiosInstance, factoryConfig, datasetConfig, spatialCoverageProvider);
    } else if (datasetConfig.type === 'vector' && openSearchClient) {
        return getAdamVectorMapViewConfig(datasetConfig, openSearchClient);
    }
};
