import { action, computed, IObservableArray, IReactionDisposer, makeObservable, observable, reaction, when } from 'mobx';

import { AxiosInstanceWithCancellation, LoadingState, SortOrder, STRING_FIELD_ID } from '@oidajs/core';
import { Entity, QueryParams, AsyncDataFetcher, DataFilters, DataFiltersProps } from '@oidajs/state-mobx';
import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps } from '@oidajs/eo-mobx';

import {
    AdamOpensearchDatasetDiscoveryResponseV2,
    AdamOpensearchDatasetMetadataV2,
    AdamOpensearchProductMetadataV2,
    AdamOpensearchProductSearchResponseV2
} from '../common';
import { AdamGranuleFactory, getAdamGranuleFactory } from '../get-adam-granule-factory';
import { AdamOpensearchDatasetDiscoveryClientV2 } from './adam-opensearch-dataset-discovery-client-v2';

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE_V2 = 'adam_opensearch_discovery_item_v2';

export type AdamOpensearchDatasetDiscoveryJsonSchemaV2 = {
    id: string;
    datasetId: string;
    productId: string;
};

export type AdamOpensearchDatasetDiscoveryProviderItemPropsV2 = {
    dataset: AdamOpensearchDatasetMetadataV2;
    product: AdamOpensearchProductMetadataV2;
};

export class AdamOpensearchDatasetDiscoveryProviderItemV2 extends Entity {
    public readonly dataset: AdamOpensearchDatasetMetadataV2;
    public readonly product: AdamOpensearchProductMetadataV2;

    constructor(props: AdamOpensearchDatasetDiscoveryProviderItemPropsV2) {
        super({
            entityType: ADAM_OPENSEARCH_DATASET_DISCOVERY_ITEM_TYPE_V2,
            id: props.product._id.$oid
        });

        this.dataset = props.dataset;
        this.product = props.product;
    }

    get geometry() {
        return this.product.geometry;
    }
}

export const ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2 = 'adam_opensearch_v2';

export type AdamOpensearchDatasetDiscoveryProviderPropsV2 = {
    searchClient: AdamOpensearchDatasetDiscoveryClientV2;
    commonFilters?: DataFilters | DataFiltersProps;
    axiosInstance?: AxiosInstanceWithCancellation | undefined;
} & DatasetDiscoveryProviderProps<typeof ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2>;

export type AdamOpenSearchDatasetQuery = {
    params: QueryParams;
    fetcher: AsyncDataFetcher<AdamOpensearchProductSearchResponseV2, void>;
    results: IObservableArray<AdamOpensearchDatasetDiscoveryProviderItemV2>;
    updateDisposer?: IReactionDisposer;
};

export enum AdamOpensearchDatasetDiscoveryStep {
    QueryDefinition = 'Search',
    ResultsExploration = 'Results'
}

export class AdamOpensearchDatasetDiscoveryProviderV2 extends DatasetDiscoveryProvider<
    AdamOpensearchDatasetDiscoveryProviderItemV2,
    AdamOpensearchDatasetDiscoveryJsonSchemaV2
> {
    readonly commonQueryFilters: DataFilters;
    @observable.ref datasetQueries: Record<string, AdamOpenSearchDatasetQuery>;

    readonly searchClient: AdamOpensearchDatasetDiscoveryClientV2;
    protected datasetFactory_: AdamGranuleFactory;

    protected datasets_: Record<string, AdamOpensearchDatasetMetadataV2>;
    @observable.ref protected activeResults_: string | undefined;
    protected readonly datasetFetcher_: AsyncDataFetcher<AdamOpensearchDatasetDiscoveryResponseV2, void>;
    @observable.ref protected currentStep_: AdamOpensearchDatasetDiscoveryStep;

    constructor(props: Omit<AdamOpensearchDatasetDiscoveryProviderPropsV2, 'providerType'>) {
        super({
            providerType: ADAM_OPENSEARCH_DATASET_DISCOVERY_PROVIDER_TYPE_V2,
            ...props
        });

        this.commonQueryFilters = props?.commonFilters instanceof DataFilters ? props.commonFilters : new DataFilters(props.commonFilters);
        this.datasetQueries = {};
        this.activeResults_ = undefined;
        this.datasets_ = {};
        this.currentStep_ = AdamOpensearchDatasetDiscoveryStep.QueryDefinition;
        this.searchClient = props.searchClient;

        this.datasetFactory_ = getAdamGranuleFactory({
            axiosInstance: props.axiosInstance
        });

        this.datasetFetcher_ = new AsyncDataFetcher({
            dataFetcher: () => {
                return this.searchClient.searchDatasets({}).then((response) => {
                    this.datasets_ = response.features.reduce((datasets, feature) => {
                        return {
                            ...datasets,
                            [feature.datasetId]: feature
                        };
                    }, {});

                    return response;
                });
            }
        });

        makeObservable(this);

        this.afterInit_();
    }

    get datasetsLoadingState() {
        return this.datasetFetcher_.loadingStatus.value;
    }

    get activeResults() {
        return this.activeResults_;
    }

    @computed
    get datasets() {
        return this.datasetsLoadingState === LoadingState.Success ? Object.values(this.datasets_) : [];
    }

    @computed
    get canSearch() {
        return Object.keys(this.datasetQueries).length > 0;
    }

    get results() {
        if (!this.activeResults_) {
            return this.results_;
        } else {
            return this.datasetQueries[this.activeResults_]?.results || this.results_;
        }
    }

    get currentStep() {
        return this.currentStep_;
    }

    @action
    setActiveResults(datasetId?: string | undefined) {
        this.activeResults_ = datasetId;
    }

    isDatasetEnabled(datasetId: string) {
        return this.datasetQueries[datasetId] !== undefined;
    }

    @action
    setDatasetEnabled(datasetId: string, enabled: boolean) {
        if (!enabled) {
            const { [datasetId]: datasetQuery, ...otherQueries } = this.datasetQueries;
            if (datasetQuery.updateDisposer) {
                datasetQuery.updateDisposer();
            }
            if (this.activeResults_ === datasetId) {
                this.setActiveResults(undefined);
            }
            this.datasetQueries = otherQueries;
        } else {
            const dataset = this.datasets_[datasetId];
            if (!dataset) {
                return;
            }
            const query: AdamOpenSearchDatasetQuery = {
                params: new QueryParams({
                    sorting: {
                        key: 'productDate',
                        order: SortOrder.Descending
                    }
                }),
                fetcher: new AsyncDataFetcher<AdamOpensearchProductSearchResponseV2, void>({
                    dataFetcher: () => {
                        return this.searchClient
                            .searchProducts({
                                commonFilters: this.commonQueryFilters.asArray(),
                                datasetsQueryParams: {
                                    [datasetId]: query.params.data
                                }
                            })
                            .then((response) => {
                                query.params.paging.setTotal(response[0].properties.totalResults);
                                query.results.replace(
                                    response[0].features.map((feature) => {
                                        return new AdamOpensearchDatasetDiscoveryProviderItemV2({
                                            dataset: dataset,
                                            product: feature
                                        });
                                    })
                                );
                                return response[0];
                            });
                    }
                }),
                results: observable.array([], {
                    deep: false
                })
            };

            this.datasetQueries = {
                ...this.datasetQueries,
                [datasetId]: query
            };
        }
    }

    createDataset(item: AdamOpensearchDatasetDiscoveryProviderItemV2, id?: string) {
        return this.searchClient.getAdamDatasetConfig(item.dataset, item.product).then((adamGranuletConfig) => {
            const datasetConfig = this.datasetFactory_(adamGranuletConfig);
            if (id) {
                datasetConfig.id = id;
            }
            return {
                ...datasetConfig,
                factoryInit: {
                    factoryType: this.getFactoryId_(),
                    initConfig: {
                        id: datasetConfig.id,
                        datasetId: item.dataset.datasetId,
                        productId: item.product.productId
                    }
                }
            };
        });
    }

    createDatasetFromConfig(config: AdamOpensearchDatasetDiscoveryJsonSchemaV2) {
        return when(() => this.datasetFetcher_.loadingStatus.value === LoadingState.Success).then(() => {
            const dataset = this.datasets_[config.datasetId];
            if (!dataset) {
                throw new Error(`No product with id ${config.datasetId} found`);
            }
            return this.searchClient
                .searchProducts({
                    datasetsQueryParams: {
                        [config.datasetId]: {
                            filters: [
                                {
                                    key: 'productId',
                                    type: STRING_FIELD_ID,
                                    value: config.productId
                                }
                            ],
                            paging: {
                                page: 0,
                                offset: 0,
                                pageSize: 1
                            }
                        }
                    }
                })
                .then((response) => {
                    const product = response[0].features[0];
                    if (!product) {
                        throw new Error(`No product with id ${config.productId} found`);
                    }
                    return this.createDataset(
                        new AdamOpensearchDatasetDiscoveryProviderItemV2({
                            product: product,
                            dataset: dataset
                        }),
                        config.id
                    );
                });
        });
    }

    search() {
        this.retrieveData_(true);
        this.setActiveResults(Object.keys(this.datasetQueries)[0]);
        this.currentStep_ = AdamOpensearchDatasetDiscoveryStep.ResultsExploration;
    }

    @action
    reset() {
        this.currentStep_ = AdamOpensearchDatasetDiscoveryStep.QueryDefinition;
        Object.entries(this.datasetQueries).forEach(([datasetId, query]) => {
            if (query.updateDisposer) {
                query.updateDisposer();
                delete query.updateDisposer;
                query.params.paging.reset();
            }
        });
        this.activeResults_ = undefined;
    }

    protected retrieveData_(enableAutoUpdate: boolean) {
        Object.entries(this.datasetQueries).forEach(([datasetId, query]) => {
            query.fetcher.fetchData();
            if (enableAutoUpdate) {
                query.updateDisposer = reaction(
                    () => query.params.data,
                    () => {
                        query.fetcher.fetchData();
                    }
                );
            }
        });
    }

    protected afterInit_() {
        when(
            () => this.active.value,
            () => {
                this.datasetFetcher_.fetchData().then(() => {
                    Object.keys(this.datasets_).forEach((id) => {
                        if (this.searchClient.getDatasetAdditionalConfig(id).checked) {
                            this.setDatasetEnabled(id, true);
                        }
                    });
                });
            }
        );
    }
}
