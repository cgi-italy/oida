import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { DatasetTimeDistributionConfig, DatasetProductSearchProvider } from '@oidajs/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';
import { AdamCswProductSearchProvider, AdamOpenSearchProductSearchProvider } from '../product-search';

import { AdamWcsTimeDistributionProvider } from './adam-wcs-time-distribution-provider';

export const getAdamDatasetTimeDistributionConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    datasetConfig: AdamDatasetConfig,
    searchProvider?: DatasetProductSearchProvider
) => {
    if (datasetConfig.fixedTime) {
        return undefined;
    }

    let productCatalogueConfig:
        | {
              provider: DatasetProductSearchProvider;
              timeRangeQueryParam: string;
              timeSortParam: string;
          }
        | undefined;

    if (searchProvider instanceof AdamOpenSearchProductSearchProvider) {
        productCatalogueConfig = {
            provider: searchProvider,
            timeRangeQueryParam: 'timeRange',
            timeSortParam: 'productDate'
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
            isMultiBandCoverage: datasetConfig.type !== 'vector' && isMultiBandCoverage(datasetConfig.coverages),
            axiosInstance: axiosInstance,
            productCatalogue: productCatalogueConfig
        })
    };

    return timeDistributionConfig;
};
