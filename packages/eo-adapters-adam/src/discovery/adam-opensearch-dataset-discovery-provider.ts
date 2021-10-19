import { QueryParams as QueryCriteria } from '@oida/core';
import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oida/eo-mobx';
import { Entity, QueryParams, QueryParamsProps, AsyncDataFetcher } from '@oida/state-mobx';
import { autorun } from 'mobx';
import { AdamOpensearchDatasetMetadata, AdamOpensearchDatasetDiscoveryResponse } from '../common';
import { AdamDatasetFactoryConfig, AdamDatasetFactory, getAdamDatasetFactory } from '../get-adam-dataset-factory';
import { AdamOpensearchDatasetDiscoveryClient } from './adam-opensearch-dataset-discovery-client';

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE = 'adam_opensearch_discovery_item';

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
        // temporary fix
        // TODO: remove this once the cesium polygon fill issue is resolved
        if (this.metadata.datasetId === 'ESACCI_Biomass_L4_AGB') {
            this.visible.setValue(false);
        }
    }

    get geometry() {
        return this.metadata.geometry;
    }
}

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE = 'adam_opensearch';

export type AdamOpensearchDatasetDiscoveryProviderProps = {
    searchClient: AdamOpensearchDatasetDiscoveryClient;
    factoryConfig: AdamDatasetFactoryConfig;
    queryParams?: QueryParamsProps;
} & DatasetDiscoveryProviderProps<typeof ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE>;

export class AdamOpensearchDatasetDiscoveryProvider extends DatasetDiscoveryProvider<AdamOpensearchDatasetDiscoveryProviderItem> {

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

        this.afterInit_();
    }

    get loadingState() {
        return this.asyncDataFetcher_.loadingStatus;
    }

    createDataset(item: AdamOpensearchDatasetDiscoveryProviderItem) {
        return this.searchClient.getAdamDatasetConfig(item.metadata).then((datasetConfig) => {
            return this.datasetFactory_(datasetConfig);
        });
    }

    protected afterInit_() {
        autorun(() => {
            if (this.active.value) {
                this.asyncDataFetcher_.fetchData(this.criteria.data).then((data) => {
                    const datasets = data.features.map((metadata) => {
                        return new AdamOpensearchDatasetDiscoveryProviderItem({
                            metadata: metadata
                        });
                    });
                    this.setResults_(datasets);
                });
            }
        });
    }
}
