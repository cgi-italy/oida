import React from 'react';

import { createDynamicFactory } from '@oidajs/core';
import { DatasetDiscoveryProvider, DatasetExplorer } from '@oidajs/eo-mobx';

/**
 * Input props provided to the {@link DatasetDiscoveryProviderFactory} create method
 * to generate the UI for a {@link DatasetDiscoveryProvider}
 */
export type DatasetDiscoveryProviderProps = {
    provider: DatasetDiscoveryProvider;
    datasetExplorer: DatasetExplorer;
    onDatasetAdd?: () => void;
};

/** @internal */
export interface DatasetDiscoveryProviderDefinitions {}

/**
 * A {@link IDynamicFactory | dynamic factory} for DatasetDiscoveryProvider components.
 * Used to automatically generate the provider widgets for all {@link DatasetDiscoveryProvider}
 * added to the {@link DatasetDiscovery}
 *
 * Sample usage:
 *
 * ```
 * // given a discovery provider with id MY_DISCOVERY_PROVIDER_ID
 *
 * // first define the provider UI component
 * const MyDiscoveryProviderComponent = (props: DatasetDiscoveryProviderProps) => {
 *    //the UI component implementation
 *    return null;
 * }
 *
 * // then register it to the factory
 * DatasetDiscoveryProviderFactory.register(MY_DISCOVERY_PROVIDER_ID, (config: DatasetDiscoveryProviderProps) => {
 *    return <MyDiscoveryProvider {...config}/>;
 * });
 * ```
 */
export const DatasetDiscoveryProviderFactory = createDynamicFactory<
    React.ReactNode,
    DatasetDiscoveryProviderDefinitions,
    DatasetDiscoveryProviderProps
>('dataset-discovery-provider');
