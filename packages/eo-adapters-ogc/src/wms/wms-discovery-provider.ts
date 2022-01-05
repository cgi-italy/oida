import { v4 as uuid } from 'uuid';

import { QueryParams as QueryCriteria } from '@oidajs/core';
import { DatasetDiscoveryProvider, DatasetDiscoveryProviderProps, DatasetConfig } from '@oidajs/eo-mobx';
import { Entity, QueryParams, QueryParamsProps, AsyncDataFetcher } from '@oidajs/state-mobx';
import { IObservableArray, observable, action, makeObservable, autorun } from 'mobx';

import { WmsServiceConfig, WmsService } from './wms-service';
import { WmsLayer } from './wms-client';
import { SubscriptionTracker } from '@oidajs/core';
import { getWmsDatasetConfig } from './wms-dataset-config';

export const WMS_DATASET_DISCOVERY_ITEM_TYPE = 'wms-discovery-provider-item';

export type WmsDatasetFactory = (item: WmsDatasetDiscoveryProviderItem) => Promise<DatasetConfig | undefined>;
export type WmsDatasetDiscoveryProviderItemProps = {
    service: WmsService;
    layer: WmsLayer;
    disablePreview?: boolean;
    datasetFactory?: WmsDatasetFactory;
};

export class WmsDatasetDiscoveryProviderItem extends Entity {
    readonly service: WmsService;
    readonly layer: WmsLayer;
    readonly disablePreview: boolean;
    readonly datasetFactory: WmsDatasetFactory | undefined;

    constructor(props: WmsDatasetDiscoveryProviderItemProps) {
        super({
            entityType: WMS_DATASET_DISCOVERY_ITEM_TYPE,
            id: props.layer.Name || uuid()
        });

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

export class WmsDatasetDiscoveryProvider extends DatasetDiscoveryProvider<WmsDatasetDiscoveryProviderItem> {
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

    createDataset(item: WmsDatasetDiscoveryProviderItem): Promise<DatasetConfig | undefined> {
        if (item.layer.Name) {
            if (item.datasetFactory) {
                return item.datasetFactory(item);
            } else {
                return getWmsDatasetConfig({
                    layerName: item.layer.Name,
                    service: item.service
                });
            }
        } else {
            return Promise.resolve(undefined);
        }
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
