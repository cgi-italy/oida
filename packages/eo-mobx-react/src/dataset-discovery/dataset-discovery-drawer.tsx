import React, { useState, useEffect } from 'react';

import { Tooltip, Drawer, PageHeader } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { LeftOutlined } from '@ant-design/icons';

import { DatasetDiscovery, DatasetExplorer } from '@oida/eo-mobx';

import { DatasetDiscoveryProviderTabsNavigation, DatasetDiscoveryProviderRouter } from './dataset-discovery-provider-route';


export type DatasetDiscoveryDrawerProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
    title?: React.ReactNode;
    backIcon?: React.ReactNode;
    onClose: () => void;
} & Omit<DrawerProps, 'visible' | 'onClose' | 'afterVisibleChange'>;

export const DatasetDiscoveryDrawer = (props: DatasetDiscoveryDrawerProps) => {

    const { datasetDiscovery, datasetExplorer, title, backIcon, onClose, ...drawerProps} = props;

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        datasetDiscovery.footprintLayer.visible.setValue(true);

        return () => {
            datasetDiscovery.footprintLayer.visible.setValue(false);
        };
    }, []);


    return (
        <Drawer
            className='dataset-discovery-drawer'
            title={
                <PageHeader
                    title={props.title || 'Data discovery'}
                    onBack={() => setVisible(false)}
                    backIcon={props.backIcon || <Tooltip title='Back to map'><LeftOutlined/></Tooltip>}
                    footer={
                        <DatasetDiscoveryProviderTabsNavigation
                            datasetDiscovery={datasetDiscovery}
                        />
                    }
                >
                </PageHeader>
            }
            placement='right'
            closable={false}
            mask={false}
            {...drawerProps}
            visible={visible}
            onClose={() => {
                setVisible(false);
            }}
            afterVisibleChange={(visible) => {
                if (!visible) {
                    props.onClose();
                }
            }}
        >
            {visible && <DatasetDiscoveryProviderRouter
                datasetDiscovery={datasetDiscovery}
                datasetExplorer={datasetExplorer}
            />}
        </Drawer>
    );
};
