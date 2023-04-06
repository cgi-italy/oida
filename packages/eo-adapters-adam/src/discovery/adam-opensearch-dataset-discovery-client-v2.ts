import { AxiosInstanceWithCancellation, createAxiosInstance, ENUM_FIELD_ID, QueryFilter, QueryParams } from '@oidajs/core';

import {
    AdamOpenSearchClientV2,
    AdamOpensearchDatasetDiscoveryResponseV2,
    AdamOpensearchDatasetMetadataV2,
    AdamOpensearchProductMetadataV2
} from '../common';
import { AdamGranuleConfig } from '../adam-granule-config';
import { extractWCSParamsFromLink } from '../utils';

export type AdamGranuleAdditionalConfig = Partial<AdamGranuleConfig> & {
    disabled?: boolean;
    checked?: boolean;
};

export type AdamOpensearchDatasetDiscoveryClientV2Config = {
    serviceUrl: string;
    additionalDatasetConfig?: Record<string, AdamGranuleAdditionalConfig>;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export type AdamOpensearchDatasetDiscoverySearchParams = {
    commonFilters?: QueryFilter[];
    datasetsQueryParams: Record<string, QueryParams>;
};

export class AdamOpensearchDatasetDiscoveryClientV2 {
    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected openSearchClient_: AdamOpenSearchClientV2;
    protected additionalDatasetConfig_: Record<string, AdamGranuleAdditionalConfig>;

    constructor(config: AdamOpensearchDatasetDiscoveryClientV2Config) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.openSearchClient_ = new AdamOpenSearchClientV2({
            serviceUrl: config.serviceUrl,
            axiosInstance: this.axiosInstance_
        });
        this.additionalDatasetConfig_ = config.additionalDatasetConfig || {};
    }

    searchDatasets(queryParams: QueryParams) {
        const filters = queryParams.filters?.slice() || [];

        return this.openSearchClient_
            .getDatasets({
                ...queryParams,
                filters: filters
            })
            .then((response) => {
                return {
                    ...response,
                    features: response.features.filter((feature) => {
                        return !this.additionalDatasetConfig_[feature.datasetId]?.disabled;
                    })
                } as AdamOpensearchDatasetDiscoveryResponseV2;
            });
    }

    getDatasetAdditionalConfig(datasetId: string) {
        return this.additionalDatasetConfig_[datasetId] || {};
    }

    searchProducts(searchParams: AdamOpensearchDatasetDiscoverySearchParams) {
        const queries = Object.entries(searchParams.datasetsQueryParams).map(([datasetId, queryParams]) => {
            return this.openSearchClient_.searchProducts({
                ...queryParams,
                filters: [
                    {
                        key: 'datasetId',
                        type: ENUM_FIELD_ID,
                        value: datasetId
                    },
                    ...(searchParams.commonFilters || []),
                    ...(queryParams.filters || [])
                ]
            });
        });

        return Promise.all(queries).then((responses) => {
            return responses;
        });
    }

    getAdamDatasetConfig(dataset: AdamOpensearchDatasetMetadataV2, product: AdamOpensearchProductMetadataV2): Promise<AdamGranuleConfig> {
        const additionalConfig = this.getDatasetAdditionalConfig(dataset.datasetId);
        return Promise.resolve({
            id: product.productId,
            name: product.productId,
            subdatasets: Object.entries(product.subDatasets)
                .filter(([, value]) => {
                    return !!value.wcsPath;
                })
                .map(([id, value]) => {
                    const { url, coverageId, request, service, version, scale, format, ...wcsParams } = extractWCSParamsFromLink(
                        value.wcsPath
                    );

                    const additionalSubdatasetConfig = additionalConfig?.subdatasets?.find((subdataset) => subdataset.id === id);
                    return {
                        id: id,
                        name: id,
                        wcsCoverage: coverageId,
                        wcsUrl: url,
                        wcsParams: {
                            subset: wcsParams.subset,
                            subdataset: wcsParams.subdataset,
                            ...wcsParams.parameters
                        },
                        domain: {
                            min: dataset.subDatasets[id].minValue[0],
                            max: dataset.subDatasets[id].maxValue[0]
                        },
                        ...additionalSubdatasetConfig
                    };
                })
        } as AdamGranuleConfig);
    }
}
