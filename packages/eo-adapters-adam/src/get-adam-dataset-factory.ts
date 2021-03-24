import { createAxiosInstance } from '@oida/core';

import { AdamDatasetConfig } from './adam-dataset-config';

import { DatasetConfig, ProductSearchRecord } from  '@oida/eo-mobx';

import { getAdamDatasetProductSearchConfig } from './product-search';
import { getAdamDatasetTimeDistributionConfig } from './time';
import { getAdamDatasetDownloadConfig } from './download';
import { getAdamDatasetToolsConfig } from './tools';
import { getAdamDatasetMapViewConfig } from './map-view';
import { getAdamDatasetSpatialCoverageProvider } from './get-adam-dataset-spatial-coverage-provider';

export type AdamDatasetFactoryConfig = {
    wcsServiceUrl: string;
    cswServiceUrl: string;
    wpsServiceUrl?: string;
    productSearchRecordContent?: (item: ProductSearchRecord) => any
};

export const getAdamDatasetFactory = (factoryConfig: AdamDatasetFactoryConfig) => {

    const axiosInstance = createAxiosInstance();


    const datasetFactory = (config: AdamDatasetConfig) => {

        const productSearchConfig = getAdamDatasetProductSearchConfig(axiosInstance, factoryConfig, config);
        const timeDistributionConfig = getAdamDatasetTimeDistributionConfig(
            axiosInstance, factoryConfig, config, productSearchConfig?.searchProvider
        );
        const spatialCoverageProvider = getAdamDatasetSpatialCoverageProvider(axiosInstance, factoryConfig, config);

        let datasetConfig: DatasetConfig = {
            id: config.id,
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
