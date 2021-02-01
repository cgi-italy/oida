import { AxiosInstanceWithCancellation } from '@oida/core';
import { DatasetTimeDistributionConfig, DatasetProductSearchProvider } from  '@oida/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';

import { AdamWcsTimeDistributionProvider } from './adam-wcs-time-distribution-provider';

export const getAdamDatasetTimeDistributionConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    searchProvider?: DatasetProductSearchProvider
) => {

    let coverageId: string;
    if (isMultiBandCoverage(datasetConfig.coverages)) {
        coverageId = datasetConfig.coverages.wcsCoverage;
    } else {
        coverageId = datasetConfig.coverages[0].wcsCoverage;
    }


    let timeDistributionConfig: DatasetTimeDistributionConfig = {
        provider: new AdamWcsTimeDistributionProvider({
            serviceUrl: factoryConfig.wcsServiceUrl,
            coverageId: coverageId,
            axiosInstance: axiosInstance,
            searchProvider: searchProvider,
            fixedTime: datasetConfig.fixedTime
        })
    };

    return timeDistributionConfig;
};
