import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oida/eo-mobx';
import { AdamDatasetConfig } from '../adam-dataset-config';
import { Entity, QueryParams, QueryParamsProps } from '@oida/state-mobx';
import { reaction } from 'mobx';
import { AdamDatasetFactoryConfig, AdamDatasetFactory, getAdamDatasetFactory } from '../get-adam-dataset-factory';

export const ADAM_DATASET_DISCOVERY_ITEM_TYPE = 'adam';

export type AdamDatasetDiscoveryProviderItemProps = {
    datasetConfig: AdamDatasetConfig;
};

export class AdamDatasetDiscoveryProviderItem extends Entity {

    datasetConfig: AdamDatasetConfig;

    constructor(props: AdamDatasetDiscoveryProviderItemProps) {
        super({
            entityType: ADAM_DATASET_DISCOVERY_ITEM_TYPE,
            id: props.datasetConfig.id
        });

        this.datasetConfig = props.datasetConfig;
    }
}

export const ADAM_DATASET_DISCOVERY_PROVIDER_TYPE = 'adam';

export type AdamDatasetDiscoveryProviderProps = {
    providerType: typeof ADAM_DATASET_DISCOVERY_PROVIDER_TYPE;
    datasets: AdamDatasetConfig[];
    factoryConfig: AdamDatasetFactoryConfig;
    queryParams?: QueryParamsProps;
} & Omit<DatasetDiscoveryProviderProps, 'providerType'>;

export class AdamDatasetDiscoveryProvider extends DatasetDiscoveryProvider<AdamDatasetDiscoveryProviderItem> {

    readonly criteria: QueryParams;
    readonly datasets: AdamDatasetConfig[];
    protected datasetFactory_: AdamDatasetFactory;

    constructor(props: Omit<AdamDatasetDiscoveryProviderProps, 'providerType'>) {
        super({
            providerType: ADAM_DATASET_DISCOVERY_PROVIDER_TYPE,
            ...props
        });

        this.criteria = new QueryParams(props.queryParams);
        this.datasets = props.datasets;

        this.datasetFactory_ = getAdamDatasetFactory(props.factoryConfig);

        this.afterInit_();
    }

    createDataset(datasetConfig: AdamDatasetConfig) {
        return this.datasetFactory_(datasetConfig);
    }

    protected afterInit_() {
        reaction(() => this.criteria.data, (criteria) => {
            const results = this.datasets.map((dataset) => {
                return new AdamDatasetDiscoveryProviderItem({
                    datasetConfig: dataset
                });
            });

            this.setResults_(results);
        }, {fireImmediately: true});
    }
}

DatasetDiscoveryProvider.register(ADAM_DATASET_DISCOVERY_PROVIDER_TYPE, AdamDatasetDiscoveryProvider);
