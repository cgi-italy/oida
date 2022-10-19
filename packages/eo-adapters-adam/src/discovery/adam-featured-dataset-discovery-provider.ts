import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oidajs/eo-mobx';
import { Entity, QueryParams, QueryParamsProps } from '@oidajs/state-mobx';
import { autorun } from 'mobx';
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

export type AdamFeaturedDatasetDiscoveryJsonSchema = {
    datasetId: string;
};

export const ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE = 'adam_featured';

export type AdamFeaturedDatasetDiscoveryProviderProps = {
    datasets: AdamFeaturedDataset[];
    factoryConfig: AdamDatasetFactoryConfig;
    queryParams?: QueryParamsProps;
} & DatasetDiscoveryProviderProps<typeof ADAM_FEATURED_DATASET_DISCOVERY_PROVIDER_TYPE>;

export class AdamFeaturedDatasetDiscoveryProvider extends DatasetDiscoveryProvider<
    AdamFeaturedDatasetDiscoveryProviderItem,
    AdamFeaturedDatasetDiscoveryJsonSchema
> {
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

    createDataset(item: AdamFeaturedDatasetDiscoveryProviderItem) {
        return this.searchClient.getAdamDatasetConfig(item.dataset).then((config) => {
            return {
                ...this.datasetFactory_(config),
                factoryInit: {
                    factoryType: this.getFactoryId_(),
                    initConfig: {
                        datasetId: item.id
                    }
                }
            };
        });
    }

    createDatasetFromConfig(config: AdamFeaturedDatasetDiscoveryJsonSchema) {
        const featuredDataset = this.searchClient.getDataset(config.datasetId);
        if (!featuredDataset) {
            throw new Error(`No dataset with id ${config.datasetId} found`);
        }
        return this.createDataset(
            new AdamFeaturedDatasetDiscoveryProviderItem({
                dataset: featuredDataset
            })
        );
    }

    protected afterInit_() {
        autorun(() => {
            if (this.active.value) {
                this.searchClient.searchDatasets(this.criteria.data).then((data) => {
                    const results = data.datasets.map((dataset) => {
                        return new AdamFeaturedDatasetDiscoveryProviderItem({
                            dataset: dataset
                        });
                    });

                    this.setResults_(results);
                    this.criteria.paging.setTotal(data.total);
                });
            }
        });
    }
}
