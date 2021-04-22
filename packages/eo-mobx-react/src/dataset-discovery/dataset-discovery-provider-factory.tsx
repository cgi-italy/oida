import React from 'react';

import { createDynamicFactory } from '@oida/core';
import { DatasetDiscoveryProvider, DatasetExplorer } from '@oida/eo-mobx';

export type DatasetDiscoveryProviderProps = {
    provider: DatasetDiscoveryProvider,
    datasetExplorer: DatasetExplorer
};

export interface DatasetDiscoveryProviderDefinitions {

}

/**
 * A {@link IDynamicFactory | dynamic factory} for DatasetDiscoveryProvider components
 */
export const DatasetDiscoveryProviderFactory = createDynamicFactory<
    React.ReactNode, DatasetDiscoveryProviderDefinitions, DatasetDiscoveryProviderProps
>('dataset-discovery-provider');
