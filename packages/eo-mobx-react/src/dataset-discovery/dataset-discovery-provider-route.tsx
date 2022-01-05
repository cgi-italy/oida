import React from 'react';
import { useResolvedPath } from 'react-router-dom';
import { Tabs, Tooltip } from 'antd';

import { DatasetDiscovery, DatasetExplorer } from '@oidajs/eo-mobx';
import { BreadcrumbItem, useSelector } from '@oidajs/ui-react-mobx';

import { DatasetDiscoveryProviderFactory } from './dataset-discovery-provider-factory';

export type DatasetDiscoveryProviderRouteProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
};

export const DatasetDiscoveryProviderRoute = (props: DatasetDiscoveryProviderRouteProps) => {
    const { discoveryContent, provider } = useSelector(() => {
        const provider = props.datasetDiscovery.selectedProvider;
        if (provider) {
            return {
                discoveryContent: DatasetDiscoveryProviderFactory.create(provider.type, {
                    provider: provider,
                    datasetExplorer: props.datasetExplorer
                }),
                provider: provider
            };
        } else {
            return {
                provider: provider,
                discoveryContent: undefined
            };
        }
    });

    const providerPath = useResolvedPath('./');

    return (
        <React.Fragment>
            {provider && (
                <BreadcrumbItem
                    data={{
                        key: 'discovery-provider',
                        title: provider.name,
                        link: providerPath.pathname
                    }}
                />
            )}
            {discoveryContent}
        </React.Fragment>
    );
};

export const DatasetDiscoveryProviderTabsNavigation = (props: { datasetDiscovery: DatasetDiscovery }) => {
    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider?.id);

    const tabs = useSelector(() => props.datasetDiscovery.providers.filter((provider) => !provider.disabled)).map((provider) => {
        return (
            <Tabs.TabPane
                tab={
                    <Tooltip title={provider.description}>
                        <span>{provider.name}</span>
                    </Tooltip>
                }
                key={provider.id}
            />
        );
    });

    return (
        <Tabs activeKey={selectedProvider} onChange={(tabId) => props.datasetDiscovery.selectProvider(tabId)} size='small'>
            {tabs}
        </Tabs>
    );
};
