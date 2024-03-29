import { QueryParams as QueryCriteria, STRING_FIELD_ID } from '@oidajs/core';
import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oidajs/eo-mobx';
import { Entity, QueryParams, QueryParamsProps, AsyncDataFetcher } from '@oidajs/state-mobx';
import { autorun, reaction, when } from 'mobx';
import { AdamOpensearchDatasetMetadata, AdamOpensearchDatasetDiscoveryResponse } from '../common';
import { AdamDatasetFactoryConfig, AdamDatasetFactory, getAdamDatasetFactory } from '../get-adam-dataset-factory';
import { AdamOpensearchDatasetDiscoveryClient } from './adam-opensearch-dataset-discovery-client';

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE = 'adam_opensearch_discovery_item';

export type AdamOpensearchDatasetDiscoveryJsonSchema = {
    id: string;
    datasetId: string;
};

export type AdamOpensearchDatasetDiscoveryProviderItemProps = {
    metadata: AdamOpensearchDatasetMetadata;
};

export class AdamOpensearchDatasetDiscoveryProviderItem extends Entity {
    metadata: AdamOpensearchDatasetMetadata;

    constructor(props: AdamOpensearchDatasetDiscoveryProviderItemProps) {
        super({
            entityType: ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE,
            id: props.metadata.datasetId
        });

        this.metadata = props.metadata;
    }

    get geometry() {
        return this.metadata.geometry;
    }
}

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE = 'adam_opensearch';

export type AdamOpensearchDatasetDiscoveryProviderProps = {
    searchClient: AdamOpensearchDatasetDiscoveryClient;
    factoryConfig: AdamDatasetFactoryConfig;
    isStatic?: boolean;
    queryParams?: QueryParamsProps;
} & DatasetDiscoveryProviderProps<typeof ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE>;

export class AdamOpensearchDatasetDiscoveryProvider extends DatasetDiscoveryProvider<
    AdamOpensearchDatasetDiscoveryProviderItem,
    AdamOpensearchDatasetDiscoveryJsonSchema
> {
    readonly criteria: QueryParams;
    readonly searchClient: AdamOpensearchDatasetDiscoveryClient;
    protected datasetFactory_: AdamDatasetFactory;
    protected readonly asyncDataFetcher_: AsyncDataFetcher<AdamOpensearchDatasetDiscoveryResponse, QueryCriteria>;

    constructor(props: Omit<AdamOpensearchDatasetDiscoveryProviderProps, 'providerType'>) {
        super({
            providerType: ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE,
            ...props
        });

        this.criteria = new QueryParams(props.queryParams);
        this.searchClient = props.searchClient;

        this.datasetFactory_ = getAdamDatasetFactory(props.factoryConfig);

        this.asyncDataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.searchClient.searchDatasets(params);
            }
        });

        this.afterInit_(props.isStatic);
    }

    get loadingState() {
        return this.asyncDataFetcher_.loadingStatus;
    }

    createDataset(item: AdamOpensearchDatasetDiscoveryProviderItem, id?: string) {
        return this.searchClient.getAdamDatasetConfig(item.metadata).then((adamDatasetConfig) => {
            const datasetConfig = this.datasetFactory_(adamDatasetConfig);
            if (id) {
                datasetConfig.id = id;
            }
            return {
                ...datasetConfig,
                factoryInit: {
                    factoryType: this.getFactoryId_(),
                    initConfig: {
                        id: datasetConfig.id,
                        datasetId: item.id
                    }
                }
            };
        });
    }

    createDatasetFromConfig(config: AdamOpensearchDatasetDiscoveryJsonSchema) {
        return this.searchClient
            .searchDatasets({
                filters: [
                    {
                        key: 'datasetId',
                        type: STRING_FIELD_ID,
                        value: config.datasetId
                    }
                ]
            })
            .then((response) => {
                const dataset = response.features[0];
                if (!dataset) {
                    throw new Error(`No dataset with id ${config.datasetId} found`);
                }
                return this.createDataset(
                    new AdamOpensearchDatasetDiscoveryProviderItem({
                        metadata: dataset
                    }),
                    config.id
                );
            });
    }

    protected retrieveData_() {
        return this.asyncDataFetcher_.fetchData(this.criteria.data).then((data) => {
            const datasets = data.features.map((metadata) => {
                return new AdamOpensearchDatasetDiscoveryProviderItem({
                    metadata: metadata
                });
            });
            this.setResults_(datasets);
            this.criteria.paging.setTotal(data.properties.totalResults);
        });
    }

    protected afterInit_(isStatic?: boolean) {
        if (isStatic) {
            const populateResultsOnActivation = () => {
                when(
                    () => this.active.value,
                    () => {
                        this.retrieveData_().catch((error) => {
                            // retry getting results on next activation
                            when(
                                () => !this.active.value,
                                () => {
                                    populateResultsOnActivation();
                                }
                            );
                        });
                    }
                );
            };

            populateResultsOnActivation();

            reaction(
                () => this.criteria.data,
                () => {
                    if (this.active.value) {
                        this.retrieveData_();
                    }
                }
            );
        } else {
            autorun(() => {
                if (this.active.value) {
                    this.retrieveData_();
                }
            });
        }
    }
}
