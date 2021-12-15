import { v4 as uuid } from 'uuid';

import { createAxiosInstance } from '@oidajs/core';
import { DatasetConfig, ProductSearchRecord } from  '@oidajs/eo-mobx';

import { AdamDatasetConfig } from './adam-dataset-config';
import { getAdamDatasetProductSearchConfig } from './product-search';
import { getAdamDatasetTimeDistributionConfig } from './time';
import { getAdamDatasetDownloadConfig } from './download';
import { getAdamDatasetToolsConfig } from './tools';
import { getAdamDatasetMapViewConfig } from './map-view';
import { getAdamDatasetSpatialCoverageProvider } from './get-adam-dataset-spatial-coverage-provider';
import { AdamOpenSearchClient } from './common';

export type AdamDatasetFactoryConfig = {
    wcsServiceUrl: string;
    cswServiceUrl: string;
    wpsServiceUrl?: string;
    opensearchUrl?: string;
    productSearchRecordContent?: (item: ProductSearchRecord) => any
};

export const getAdamDatasetFactory = (factoryConfig: AdamDatasetFactoryConfig) => {

    const axiosInstance = createAxiosInstance();

    let openSearchClient: AdamOpenSearchClient | undefined;
    if (factoryConfig.opensearchUrl) {
        openSearchClient = new AdamOpenSearchClient({
            axiosInstance: axiosInstance,
            serviceUrl: factoryConfig.opensearchUrl
        });
    }

    const datasetFactory = (config: AdamDatasetConfig) => {

        const productSearchConfig = getAdamDatasetProductSearchConfig(axiosInstance, factoryConfig, config, openSearchClient);
        const timeDistributionConfig = getAdamDatasetTimeDistributionConfig(
            axiosInstance, factoryConfig, config, productSearchConfig?.searchProvider
        );
        const spatialCoverageProvider = getAdamDatasetSpatialCoverageProvider(axiosInstance, factoryConfig, config);

        let datasetConfig: DatasetConfig = {
            id: uuid(),
            name: config.name,
            color: config.color,
            filters: [],
            productSearch: productSearchConfig,
            timeDistribution: timeDistributionConfig,
            mapView: getAdamDatasetMapViewConfig(axiosInstance, factoryConfig, config, spatialCoverageProvider),
            tools: getAdamDatasetToolsConfig(axiosInstance, factoryConfig, config, timeDistributionConfig?.provider),
            download: getAdamDatasetDownloadConfig(axiosInstance, factoryConfig, config),
            spatialCoverageProvider: spatialCoverageProvider
        };

        return datasetConfig;
    };

    return datasetFactory;
};

export type AdamDatasetFactory = ReturnType<typeof getAdamDatasetFactory>;
