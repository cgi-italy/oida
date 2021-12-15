import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { DatasetProductSearchConfig } from  '@oidajs/eo-mobx';

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

    let wcsPreviewConfig: AdamWcsPreviewConfig;
    if (isMultiBandCoverage(datasetConfig.coverages)) {

        wcsPreviewConfig = {
            serviceUrl: factoryConfig.wcsServiceUrl,
            coverageId: datasetConfig.coverages.wcsCoverage,
            size: 64
        };

        if (!datasetConfig.coverages.isTrueColor) {
            const bands = datasetConfig.coverages.presets[0].bands;
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

    let searchConfig: DatasetProductSearchConfig = {
        searchProvider: openSearchClient ? new AdamOpenSearchProductSearchProvider({
            datasetId: datasetConfig.id,
            openSearchClient: openSearchClient
        }) : new AdamCswProductSearchProvider({
            collectionId: datasetConfig.id,
            serviceUrl: factoryConfig.cswServiceUrl,
            wcsPreview: wcsPreviewConfig,
            axiosInstance: axiosInstance,
            extentOffset: datasetConfig.requestExtentOffset
        }),
        searchItemContent: datasetConfig.productSearchRecordContent || factoryConfig.productSearchRecordContent
    };

    return searchConfig;

};
