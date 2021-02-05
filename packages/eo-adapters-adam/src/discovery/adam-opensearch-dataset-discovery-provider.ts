import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oida/eo-mobx';
import { Entity, QueryParams, QueryParamsProps, AsyncDataFetcher } from '@oida/state-mobx';
import { reaction } from 'mobx';
import { AdamDatasetFactoryConfig, AdamDatasetFactory, getAdamDatasetFactory } from '../get-adam-dataset-factory';
import { AdamDatasetMetadata, AdamOpensearchDatasetDiscoveryClient, AdamDatasetDiscoveryResponse } from './adam-opensearch-dataset-discovery-client';

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE = 'adam_opensearch_discovery_item';

export type AdamOpensearchDatasetDiscoveryProviderItemProps = {
    metadata: AdamDatasetMetadata;
};

export class AdamOpensearchDatasetDiscoveryProviderItem extends Entity {

    metadata: AdamDatasetMetadata;

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
    providerType: typeof ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE;
    searchClient: AdamOpensearchDatasetDiscoveryClient;
    factoryConfig: AdamDatasetFactoryConfig;
    queryParams?: QueryParamsProps;
} & Omit<DatasetDiscoveryProviderProps, 'providerType'>;

export class AdamOpensearchDatasetDiscoveryProvider extends DatasetDiscoveryProvider<AdamOpensearchDatasetDiscoveryProviderItem> {

    readonly criteria: QueryParams;
    readonly searchClient: AdamOpensearchDatasetDiscoveryClient;
    protected datasetFactory_: AdamDatasetFactory;
    protected readonly asyncDataFetcher_: AsyncDataFetcher<AdamDatasetDiscoveryResponse>;

    constructor(props: Omit<AdamOpensearchDatasetDiscoveryProviderProps, 'providerType'>) {
        super({
            providerType: ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE,
            ...props
        });

        this.criteria = new QueryParams(props.queryParams);
        this.searchClient = props.searchClient;

        this.datasetFactory_ = getAdamDatasetFactory(props.factoryConfig);

        this.asyncDataFetcher_ = new AsyncDataFetcher({
            dataFetcher: () => {
                return this.searchClient.searchDatasets(this.criteria.data);
            }
        });

        this.afterInit_();
    }

    get loadingState() {
        return this.asyncDataFetcher_.loadingStatus;
    }

    createDataset(metadata: AdamDatasetMetadata) {
        return this.searchClient.getAdamDatasetConfig(metadata).then((datasetConfig) => {
            return this.datasetFactory_(datasetConfig);
        });
    }

    protected afterInit_() {
        reaction(() => this.criteria.data, (criteria) => {
            this.asyncDataFetcher_.fetchData().then((data) => {
                const datasets = data.features.map((metadata) => {
                    return new AdamOpensearchDatasetDiscoveryProviderItem({
                        metadata: metadata
                    });
                });
                this.setResults_(datasets);
                return data;
            });
        }, {fireImmediately: true});
    }
}

DatasetDiscoveryProvider.register(ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE, AdamOpensearchDatasetDiscoveryProvider);
