import { AxiosInstanceWithCancellation } from '@oidajs/core';

import { AdamDatasetConfig, AdamDatasetRenderMode } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { AdamSpatialCoverageProvider } from '../get-adam-dataset-spatial-coverage-provider';
import { GeotiffLoader } from '../utils';

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
    geotiffLoader: GeotiffLoader,
    openSearchClient?: AdamOpenSearchClient
) => {
    if (datasetConfig.type === 'vertical_profile') {
        return getAdamVerticalProfileViewConfig(axiosInstance, factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'volume') {
        return getAdamVolumetricMapViewConfig(factoryConfig, datasetConfig);
    } else if (datasetConfig.type === 'raster') {
        return getAdamRasterMapViewConfig(
            factoryConfig,
            datasetConfig,
            spatialCoverageProvider,
            datasetConfig.renderMode === AdamDatasetRenderMode.ClientSide ? geotiffLoader : undefined
        );
    } else if (datasetConfig.type === 'vector' && openSearchClient) {
        return getAdamVectorMapViewConfig(datasetConfig, openSearchClient);
    }
};
