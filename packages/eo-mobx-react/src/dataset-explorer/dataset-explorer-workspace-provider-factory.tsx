import React from 'react';

import { createDynamicFactory } from '@oidajs/core';
import { DatasetExplorerWorkspaceHandler, DatasetExplorerWorkspaceProvider } from '@oidajs/eo-mobx';

export type DatasetExplorerWorkspaceProviderProps = {
    provider: DatasetExplorerWorkspaceProvider;
    workspaceHandler: DatasetExplorerWorkspaceHandler;
    onWorkspaceLoaded?: () => void;
};

/** @internal */
export interface DatasetExplorerWorkspaceProviderDefinitions {}

export const DatasetExplorerWorkspaceProviderFactory = createDynamicFactory<
    React.ReactNode,
    DatasetExplorerWorkspaceProviderDefinitions,
    DatasetExplorerWorkspaceProviderProps
>('dataset-explorer-map-view-provider');
