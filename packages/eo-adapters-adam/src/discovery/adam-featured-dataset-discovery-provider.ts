import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oida/eo-mobx';
import { AdamDatasetConfig } from '../adam-dataset-config';
import { Entity, QueryParams, QueryParamsProps } from '@oida/state-mobx';
import { reaction } from 'mobx';
import { AdamDatasetFactoryConfig, AdamDatasetFactory, getAdamDatasetFactory } from '../get-adam-dataset-factory';
import { AdamFeaturedDataset, AdamFeaturedDatasetDiscoveryClient } from './adam-featured-dataset-discovery-client';

export const ADAM_FEATURED_DATASET_DISCOVERY_ITEM_TYPE = 'adam_featured_discovery_item';

export type AdamFeaturedDatasetDiscoveryProviderItemProps = {
    dataset: AdamFeaturedDataset;
};

export class AdamFeaturedDatasetDiscoveryProviderItem extends Entity {

    dataset: AdamFeaturedDataset;

    constructor(props: AdamFeaturedDatasetDiscoveryProviderItemProps) {
        super({
            entityType: ADAM_FEATURED_DATASET_DISCOVERY_ITEM_TYPE,
            id: props.dataset.id
        });

        this.dataset = props.dataset;
    }
}

export const ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE = 'adam_featured';

export type AdamFeaturedDatasetDiscoveryProviderProps = {
    providerType: typeof ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE;
    datasets: AdamFeaturedDataset[];
    factoryConfig: AdamDatasetFactoryConfig;
    queryParams?: QueryParamsProps;
} & Omit<DatasetDiscoveryProviderProps, 'providerType'>;

export class AdamFeaturedDatasetDiscoveryProvider extends DatasetDiscoveryProvider<AdamFeaturedDatasetDiscoveryProviderItem> {

    readonly criteria: QueryParams;
    readonly searchClient: AdamFeaturedDatasetDiscoveryClient;
    protected datasetFactory_: AdamDatasetFactory;

    constructor(props: Omit<AdamFeaturedDatasetDiscoveryProviderProps, 'providerType'>) {
        super({
            providerType: ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE,
            ...props
        });

        this.criteria = new QueryParams({
            ...props.queryParams,
            paging: {
                pageSize: 10
            }
        });
        this.searchClient = new AdamFeaturedDatasetDiscoveryClient({
            datasets: props.datasets,
            wcs: {
                wcsUrl: props.factoryConfig.wcsServiceUrl
            }
        });

        this.datasetFactory_ = getAdamDatasetFactory(props.factoryConfig);

        this.afterInit_();
    }

    createDataset(dataset: AdamFeaturedDataset) {
        return this.searchClient.getAdamDatasetConfig(dataset).then((config) => {
            return this.datasetFactory_(config);
        });
    }

    protected afterInit_() {
        reaction(() => this.criteria.data, (criteria) => {
            this.searchClient.searchDatasets(criteria).then((data) => {
                const results = data.datasets.map((dataset) => {
                    return new AdamFeaturedDatasetDiscoveryProviderItem({
                        dataset: dataset
                    });
                });

                this.setResults_(results);
                this.criteria.paging.setTotal(data.total);
            });
        }, {fireImmediately: true});
    }
}

DatasetDiscoveryProvider.register(ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE, AdamFeaturedDatasetDiscoveryProvider);
