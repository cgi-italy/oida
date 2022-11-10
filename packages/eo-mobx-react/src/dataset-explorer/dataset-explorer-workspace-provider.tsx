import React from 'react';
import { useResolvedPath } from 'react-router-dom';

import { BreadcrumbItem, useSelector } from '@oidajs/ui-react-mobx';

import {
    DatasetExplorerWorkspaceProviderFactory,
    DatasetExplorerWorkspaceProviderProps
} from './dataset-explorer-workspace-provider-factory';

export const DatasetExplorerWorkspaceProviderComponent = (props: Omit<DatasetExplorerWorkspaceProviderProps, 'provider'>) => {
    const { providerComponent, provider } = useSelector(() => {
        const provider = props.workspaceHandler.selectedProvider;
        if (provider) {
            return {
                providerComponent: DatasetExplorerWorkspaceProviderFactory.create(provider.type, {
                    provider: provider,
                    workspaceHandler: props.workspaceHandler,
                    onWorkspaceLoaded: props.onWorkspaceLoaded
                }),
                provider: provider
            };
        } else {
            return {
                provider: provider,
                providerComponent: undefined
            };
        }
    });

    const providerPath = useResolvedPath('./');

    return (
        <React.Fragment>
            {provider && (
                <BreadcrumbItem
                    data={{
                        key: 'map-view-provider',
                        title: provider.name,
                        link: providerPath.pathname
                    }}
                />
            )}
            {providerComponent}
        </React.Fragment>
    );
};
