import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { DatasetTimeDistributionConfig, DatasetProductSearchProvider } from  '@oidajs/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { AdamCswProductSearchProvider, AdamOpenSearchProductSearchProvider } from '../product-search';

import { AdamWcsTimeDistributionProvider } from './adam-wcs-time-distribution-provider';

export const getAdamDatasetTimeDistributionConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    searchProvider?: DatasetProductSearchProvider
) => {

    if (datasetConfig.timeless) {
        return undefined;
    }

    let coverageId: string;
    if (isMultiBandCoverage(datasetConfig.coverages)) {
        coverageId = datasetConfig.coverages.wcsCoverage;
    } else {
        coverageId = datasetConfig.coverages[0].wcsCoverage;
    }

    let productCatalogueConfig: {
        provider: DatasetProductSearchProvider;
        timeRangeQueryParam: string;
        timeSortParam?: string
    } | undefined;

    if (searchProvider instanceof AdamOpenSearchProductSearchProvider) {
        productCatalogueConfig = {
            provider: searchProvider,
            timeRangeQueryParam: 'timeRange'
        };
    } else if (searchProvider instanceof AdamCswProductSearchProvider) {
        productCatalogueConfig = {
            provider: searchProvider,
            timeRangeQueryParam: 'time',
            timeSortParam: 'dc:date'
        };
    }

    const timeDistributionConfig: DatasetTimeDistributionConfig = {
        provider: new AdamWcsTimeDistributionProvider({
            serviceUrl: factoryConfig.wcsServiceUrl,
            coverageId: coverageId,
            axiosInstance: axiosInstance,
            productCatalogue: productCatalogueConfig
        })
    };

    return timeDistributionConfig;
};
