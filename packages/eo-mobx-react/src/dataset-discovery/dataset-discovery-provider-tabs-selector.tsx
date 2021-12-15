import React from 'react';

import { Tabs, Tooltip } from 'antd';

import { DatasetDiscoveryProvider } from '@oidajs/eo-mobx';


export type DatasetDiscoveryProviderSelectorProps = {
    providers: DatasetDiscoveryProvider[];
    selectedProvider?: string;
    onProviderSelect: (providerId: string) => void;
};

export const DatasetDiscoveryProviderTabsSelector = (props: DatasetDiscoveryProviderSelectorProps) => {

    const tabs = props.providers.map((provider) => {
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
    });

    return (
        <Tabs
            activeKey={props.selectedProvider}
            onChange={props.onProviderSelect}
            size='small'
        >
            {tabs}
        </Tabs>
    );
};
