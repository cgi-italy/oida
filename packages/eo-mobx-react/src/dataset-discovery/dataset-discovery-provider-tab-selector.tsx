import React from 'react';

import { Tabs, Tooltip } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import { DatasetDiscovery } from '@oida/eo-mobx';


export type DatasetDiscoveryProviderSelectorProps = {
    datasetDiscovery: DatasetDiscovery
};

export const DatasetDiscoveryProviderTabSelector = (props: DatasetDiscoveryProviderSelectorProps) => {

    const selectedProvider = useSelector(() => props.datasetDiscovery.selectedProvider);

    const tabs = useSelector(() => props.datasetDiscovery.providers.map((provider) => {
        return (
            <Tabs.TabPane
                tab={
                    <Tooltip
                        title={provider.description}
                    >
                        <span>
                            {provider.name}
                        </span>
                    </Tooltip>
                }
                key={provider.id}
            />
        );
    }));

    return (
        <Tabs
            activeKey={selectedProvider?.id}
            onChange={(value) => props.datasetDiscovery.selectProvider(value)}
            size='small'
        >
            {tabs}
        </Tabs>
    );
};
