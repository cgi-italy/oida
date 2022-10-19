import { IObservableArray, observable, action, makeObservable, autorun } from 'mobx';
import { v4 as uuid } from 'uuid';

import { QueryParams as QueryCriteria, SubscriptionTracker } from '@oidajs/core';
import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps, DatasetConfig, DatasetConfigJSON } from '@oidajs/eo-mobx';
import { Entity, QueryParams, QueryParamsProps, AsyncDataFetcher } from '@oidajs/state-mobx';

import { WmsServiceConfig, WmsService } from './wms-service';
import { WmsLayer } from './wms-client';
import { getWmsDatasetConfig } from './wms-dataset-config';

export const WMS_DATASET_DISCOVERY_ITEM_TYPE = 'wms-discovery-provider-item';

export type WmsDatasetFactory = (item: WmsDatasetDiscoveryProviderItem) => Promise<DatasetConfig>;
export type WmsDatasetDiscoveryProviderItemProps = {
    serviceId: string;
    service: WmsService;
    layer: WmsLayer;
    disablePreview?: boolean;
    datasetFactory?: WmsDatasetFactory;
};

export class WmsDatasetDiscoveryProviderItem extends Entity {
    readonly serviceId: string;
    readonly service: WmsService;
    readonly layer: WmsLayer;
    readonly disablePreview: boolean;
    readonly datasetFactory: WmsDatasetFactory | undefined;

    constructor(props: WmsDatasetDiscoveryProviderItemProps) {
        super({
            entityType: WMS_DATASET_DISCOVERY_ITEM_TYPE,
            id: props.layer.Name || uuid()
        });

        this.serviceId = props.serviceId;
        this.service = props.service;
        this.layer = props.layer;
        this.disablePreview = props.disablePreview || false;
        this.datasetFactory = props.datasetFactory;
    }
}

export const WMS_DATASET_DISCOVERY_PROVIDER_TYPE = 'wms-discovery-provider';

export type WmsItem = {
    id: string;
    name: string;
    service: WmsService;
    disablePreview?: boolean;
    datasetFactory?: WmsDatasetFactory;
};

export type WmsItemProps = {
    id: string;
    name: string;
    service: WmsService | WmsServiceConfig;
    disablePreview?: boolean;
    datasetFactory?: WmsDatasetFactory;
};

export type WmsDatasetDiscoveryProviderProps = {
    services: (WmsItem | WmsItemProps)[];
    queryParams?: QueryParamsProps;
} & DatasetDiscoveryProviderProps<typeof WMS_DATASET_DISCOVERY_PROVIDER_TYPE>;

export type WmsDatasetDiscoveryJsonSchema = {
    serviceId: string;
    layerName: string;
};

export class WmsDatasetDiscoveryProvider extends DatasetDiscoveryProvider<WmsDatasetDiscoveryProviderItem, WmsDatasetDiscoveryJsonSchema> {
    readonly criteria: QueryParams;
    readonly services: IObservableArray<WmsItem>;
    @observable.ref selectedService: WmsItem | undefined;

    protected readonly dataFetcher_: AsyncDataFetcher<WmsLayer[], { selectedService: WmsItem; criteria: QueryCriteria }>;
    protected readonly subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<WmsDatasetDiscoveryProviderProps, 'providerType'>) {
        super({
            providerType: WMS_DATASET_DISCOVERY_PROVIDER_TYPE,
            ...props
        });

        this.criteria = new QueryParams(props.queryParams);
        this.services = observable.array([], {
            deep: false
        });
        this.addServices(props.services);
        this.selectedService = undefined;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return params.selectedService.service.getFilteredWmsLayers(params.criteria).then((response) => {
                    this.criteria.paging.setTotal(response.total);
                    return response.results;
                });
            },
            debounceInterval: 500
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    addServices(services: (WmsItem | WmsItemProps)[]) {
        const items = services.map((item) => {
            const { service, ...other } = item;
            return service instanceof WmsService
                ? (item as WmsItem)
                : {
                      ...other,
                      service: new WmsService(service)
                  };
        });
        this.services.push(...items);
    }

    @action
    selectService(service: WmsItem | string | undefined) {
        let selectedService: WmsItem | undefined;
        if (typeof service === 'string') {
            selectedService = this.services.find((item) => item.id === service);
        } else {
            selectedService = service;
        }
        if (this.selectedService === selectedService) {
            return;
        }

        this.results.clear();
        this.criteria.filters.clear();
        this.criteria.paging.setPage(0);
        this.criteria.paging.setTotal(0);

        this.selectedService = selectedService;
    }

    createDataset(item: WmsDatasetDiscoveryProviderItem): Promise<DatasetConfig> {
        if (item.layer.Name) {
            let datasetConfigPromise: Promise<DatasetConfig>;
            const factoryInit: DatasetConfigJSON<WmsDatasetDiscoveryJsonSchema> = {
                factoryType: this.getFactoryId_(),
                initConfig: {
                    serviceId: item.serviceId,
                    layerName: item.layer.Name
                }
            };
            if (item.datasetFactory) {
                datasetConfigPromise = item.datasetFactory(item);
            } else {
                datasetConfigPromise = getWmsDatasetConfig({
                    layerName: item.layer.Name,
                    service: item.service
                });
            }
            return datasetConfigPromise.then((config) => {
                return {
                    ...config,
                    factoryInit: factoryInit
                };
            });
        } else {
            return Promise.reject(new Error('Layer has no name'));
        }
    }

    createDatasetFromConfig(config: WmsDatasetDiscoveryJsonSchema) {
        const serviceItem = this.services.find((service) => service.id === config.serviceId);
        if (!serviceItem) {
            throw new Error(`No service with id ${config.serviceId} found`);
        }
        return serviceItem.service.getLayerCapabilities(config.layerName).then((layer) => {
            if (!layer) {
                throw new Error(`Error retrieving layer ${config.layerName} from ${config.serviceId} service`);
            }
            return this.createDataset(
                new WmsDatasetDiscoveryProviderItem({
                    serviceId: serviceItem.id,
                    service: serviceItem.service,
                    layer: layer,
                    disablePreview: serviceItem.disablePreview,
                    datasetFactory: serviceItem.datasetFactory
                })
            );
        });
    }

    protected afterInit_() {
        const dataUpdateDisposer = autorun(() => {
            const wmsService = this.selectedService;
            if (this.active.value && wmsService) {
                this.dataFetcher_
                    .fetchData({
                        criteria: this.criteria.data,
                        selectedService: wmsService
                    })
                    .then((data) => {
                        this.setResults_(
                            data.map(
                                (item) =>
                                    new WmsDatasetDiscoveryProviderItem({
                                        serviceId: wmsService.id,
                                        service: wmsService.service,
                                        layer: item,
                                        disablePreview: wmsService.disablePreview,
                                        datasetFactory: wmsService.datasetFactory
                                    })
                            )
                        );
                    });
            }
        });

        this.subscriptionTracker_.addSubscription(dataUpdateDisposer);
    }
}
