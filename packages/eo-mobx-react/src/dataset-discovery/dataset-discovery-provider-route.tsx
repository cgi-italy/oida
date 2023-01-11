import React from 'react';
import { useResolvedPath } from 'react-router-dom';
import { Tabs, Tooltip, Select } from 'antd';

import { DatasetDiscovery, DatasetExplorer } from '@oidajs/eo-mobx';
import { BreadcrumbItem, useSelector } from '@oidajs/ui-react-mobx';

import { DatasetDiscoveryProviderFactory } from './dataset-discovery-provider-factory';

export type DatasetDiscoveryProviderRouteProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
    onDatasetAdd?: () => void;
};

export const DatasetDiscoveryProviderRoute = (props: DatasetDiscoveryProviderRouteProps) => {
    const { discoveryContent, provider } = useSelector(() => {
        const provider = props.datasetDiscovery.selectedProvider;
        if (provider) {
            return {
                discoveryContent: DatasetDiscoveryProviderFactory.create(provider.type, {
                    provider: provider,
                    datasetExplorer: props.datasetExplorer,
                    onDatasetAdd: props.onDatasetAdd
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

export const DatasetDiscoveryProviderTabsSelector = (props: { datasetDiscovery: DatasetDiscovery }) => {
    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider?.id);

    const tabs = useSelector(() => props.datasetDiscovery.providers.filter((provider) => !provider.disabled)).map((provider) => {
        return {
            key: provider.id,
            label: (
                <Tooltip title={provider.description}>
                    <span>{provider.name}</span>
                </Tooltip>
            )
        };
    });

    return (
        <Tabs
            activeKey={selectedProvider}
            onChange={(tabId) => props.datasetDiscovery.selectProvider(tabId)}
            size='small'
            className='dataset-discovery-provider-tabs-selector'
            items={tabs}
        />
    );
};

export type DatasetDiscoveryProviderSelectProps = {
    datasetDiscovery: DatasetDiscovery;
    label?: string;
};

export const DatasetDiscoveryProviderComboSelector = (props: DatasetDiscoveryProviderSelectProps) => {
    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider?.id);

    const options = useSelector(() => props.datasetDiscovery.providers.filter((provider) => !provider.disabled)).map((provider) => {
        return (
            <Select.Option key={provider.id} value={provider.id}>
                {provider.name}
            </Select.Option>
        );
    });

    return (
        <div className='dataset-discovery-provider-combo-selector'>
            <label>{props.label || 'Provider'}: </label>
            <Select value={selectedProvider} onChange={(value) => props.datasetDiscovery.selectProvider(value)}>
                {options}
            </Select>
        </div>
    );
};
