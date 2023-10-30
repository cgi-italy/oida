import { v4 as uuid } from 'uuid';

import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';
import { DatasetConfig, ProductSearchRecord } from '@oidajs/eo-mobx';

import { AdamDatasetConfig } from './adam-dataset-config';
import { getAdamDatasetProductSearchConfig } from './product-search';
import { getAdamDatasetTimeDistributionConfig } from './time';
import { getAdamDatasetDownloadConfig } from './download';
import { getAdamDatasetToolsConfig } from './tools';
import { getAdamDatasetMapViewConfig } from './map-view';
import { getAdamDatasetSpatialCoverageProvider } from './get-adam-dataset-spatial-coverage-provider';
import { AdamOpenSearchClient, AdamOpensearchMetadataModelVersion } from './common';
import { createGeoTiffLoader } from './utils';

export type AdamDatasetFactoryConfig = {
    wcsServiceUrl: string;
    cswServiceUrl: string;
    wpsServiceUrl?: string;
    opensearchUrl?: string;
    opensearchMetadataModelVersion?: AdamOpensearchMetadataModelVersion;
    productSearchRecordContent?: (item: ProductSearchRecord) => any;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export const getAdamDatasetFactory = (factoryConfig: AdamDatasetFactoryConfig) => {
    const axiosInstance = factoryConfig.axiosInstance || createAxiosInstance();

    let openSearchClient: AdamOpenSearchClient | undefined;
    if (factoryConfig.opensearchUrl) {
        openSearchClient = new AdamOpenSearchClient({
            axiosInstance: axiosInstance,
            serviceUrl: factoryConfig.opensearchUrl,
            metadataModelVersion: factoryConfig.opensearchMetadataModelVersion
        });
    }

    const datasetFactory = (config: AdamDatasetConfig) => {
        const geotiffLoader = createGeoTiffLoader({ axiosInstance, rotateImage: false });

        const productSearchConfig = getAdamDatasetProductSearchConfig(axiosInstance, factoryConfig, config, openSearchClient);
        const timeDistributionConfig = getAdamDatasetTimeDistributionConfig(axiosInstance, config, productSearchConfig?.searchProvider);
        const spatialCoverageProvider = getAdamDatasetSpatialCoverageProvider(geotiffLoader.renderer, factoryConfig, config);

        const datasetConfig: DatasetConfig = {
            id: uuid(),
            name: config.name,
            color: config.color,
            filters: [],
            productSearch: productSearchConfig,
            timeDistribution: timeDistributionConfig,
            mapView: getAdamDatasetMapViewConfig(
                axiosInstance,
                factoryConfig,
                config,
                spatialCoverageProvider,
                geotiffLoader,
                openSearchClient
            ),
            tools: getAdamDatasetToolsConfig(axiosInstance, factoryConfig, config, timeDistributionConfig?.provider),
            download: getAdamDatasetDownloadConfig(axiosInstance, factoryConfig, config),
            spatialCoverageProvider: (mapView) => {
                return spatialCoverageProvider(mapView).then((extent) => {
                    return extent?.bbox;
                });
            }
        };

        return datasetConfig;
    };

    return datasetFactory;
};

export type AdamDatasetFactory = ReturnType<typeof getAdamDatasetFactory>;
