import React from 'react';

import { DatasetDiscoveryProviderFactory,  } from '@oida/eo-mobx-react';
import { WMS_DATASET_DISCOVERY_PROVIDER_TYPE, WmsDatasetDiscoveryProvider } from '@oida/eo-adapters-ogc';

import { WmsDiscoveryProvider } from './wms-discovery-provider';

declare module '@oida/eo-mobx-react' {
    interface DatasetDiscoveryProviderDefinitions {
        [WMS_DATASET_DISCOVERY_PROVIDER_TYPE]: {
            provider: WmsDatasetDiscoveryProvider
        };
    }
}

DatasetDiscoveryProviderFactory.register(WMS_DATASET_DISCOVERY_PROVIDER_TYPE, (config) => {
    return (
        <WmsDiscoveryProvider
            {...config}
        />
    );
});

export * from './wms-discovery-provider';
