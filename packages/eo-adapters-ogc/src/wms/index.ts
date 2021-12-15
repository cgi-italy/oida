import { DatasetDiscoveryProvider } from '@oidajs/eo-mobx';

import { WMS_DATASET_DISCOVERY_PROVIDER_TYPE, WmsDatasetDiscoveryProvider, WmsDatasetDiscoveryProviderProps } from './wms-discovery-provider';

declare module '@oidajs/eo-mobx' {
    interface DatasetDiscoveryProviderDefinitions {
        [WMS_DATASET_DISCOVERY_PROVIDER_TYPE]: WmsDatasetDiscoveryProviderProps;
    }

    interface DatasetDiscoveryProviderTypes {
        [WMS_DATASET_DISCOVERY_PROVIDER_TYPE]: WmsDatasetDiscoveryProvider;
    }

}

DatasetDiscoveryProvider.register(WMS_DATASET_DISCOVERY_PROVIDER_TYPE, WmsDatasetDiscoveryProvider);


export * from './wms-client';
export * from './wms-service';
export * from './wms-time-series-tool';
export * from './wms-time-distribution-provider';
export * from './wms-discovery-provider';
export * from './wms-raster-view';
export * from './wms-dataset-config';
