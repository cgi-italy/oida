import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { DatasetProductSearchConfig, DatasetProductSearchProvider } from '@oidajs/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';
import { AdamOpenSearchClient } from '../common';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { plottyToAdamWcsColormap } from '../utils';
import { AdamCswProductSearchProvider, AdamWcsPreviewConfig } from './adam-csw-product-search-provider';
import { AdamOpenSearchProductSearchProvider } from './adam-opensearch-product-search-provider';

export const getAdamDatasetProductSearchConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    openSearchClient?: AdamOpenSearchClient
) => {
    let searchProvider: DatasetProductSearchProvider | undefined;

    if (openSearchClient) {
        searchProvider = new AdamOpenSearchProductSearchProvider({
            datasetId: datasetConfig.id,
            openSearchClient: openSearchClient
        });
    } else if (datasetConfig.type !== 'vector') {
        let wcsPreviewConfig: AdamWcsPreviewConfig;
        if (isMultiBandCoverage(datasetConfig.coverages)) {
            wcsPreviewConfig = {
                serviceUrl: factoryConfig.wcsServiceUrl,
                coverageId: datasetConfig.coverages.wcsCoverage,
                size: 64
            };

            if (!datasetConfig.coverages.isTrueColor) {
                const bands = datasetConfig.coverages.presets.length ? datasetConfig.coverages.presets[0].bands : [1];
                wcsPreviewConfig.subsets = [`bands(${bands.join(',')})`];
            }
        } else {
            const defaultCoverage = datasetConfig.coverages[0];

            let colorTable: string | undefined;
            if (defaultCoverage.default?.colorScale) {
                colorTable = plottyToAdamWcsColormap[defaultCoverage.default?.colorScale];
            }
            wcsPreviewConfig = {
                serviceUrl: factoryConfig.wcsServiceUrl,
                coverageId: defaultCoverage.wcsCoverage,
                colorTable: colorTable,
                size: 64
            };
        }

        searchProvider = new AdamCswProductSearchProvider({
            collectionId: datasetConfig.cswCollection || datasetConfig.id,
            serviceUrl: factoryConfig.cswServiceUrl,
            wcsPreview: wcsPreviewConfig,
            axiosInstance: axiosInstance,
            extentOffset: datasetConfig.requestExtentOffset
        });
    }

    let searchConfig: DatasetProductSearchConfig | undefined;
    if (searchProvider) {
        searchConfig = {
            searchProvider: searchProvider,
            searchItemContent: datasetConfig.productSearchRecordContent || factoryConfig.productSearchRecordContent
        };
    }
    return searchConfig;
};
