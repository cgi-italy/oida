import React, { useState, useEffect } from 'react';
import { Outlet, useResolvedPath } from 'react-router-dom';
import { Tooltip, Drawer, PageHeader } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { CloseOutlined } from '@ant-design/icons';

import { DatasetDiscovery, DatasetExplorer } from '@oidajs/eo-mobx';
import { BreadcrumbItem, StatePathRouter } from '@oidajs/ui-react-mobx';

import { DatasetDiscoveryProviderTabsNavigation, DatasetDiscoveryProviderRoute } from './dataset-discovery-provider-route';

export type DatasetDiscoveryDrawerProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
    title?: React.ReactNode;
    backIcon?: React.ReactNode;
    onClose: () => void;
} & Omit<DrawerProps, 'visible' | 'onClose' | 'afterVisibleChange'>;

export const DatasetDiscoveryDrawer = (props: DatasetDiscoveryDrawerProps) => {
    const { datasetDiscovery, datasetExplorer, title, backIcon, onClose, ...drawerProps } = props;

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        datasetDiscovery.footprintLayer.visible.setValue(true);

        return () => {
            datasetDiscovery.footprintLayer.visible.setValue(false);
        };
    }, []);

    const discoveryPath = useResolvedPath('./');

    return (
        <React.Fragment>
            <BreadcrumbItem
                data={{
                    key: 'discovery',
                    title: 'Data discovery',
                    link: discoveryPath.pathname
                }}
            />
            <StatePathRouter
                parentRouteElement={
                    <Drawer
                        className='dataset-discovery-drawer'
                        push={false}
                        title={
                            <PageHeader
                                title={props.title || 'Data discovery'}
                                onBack={() => setVisible(false)}
                                backIcon={
                                    props.backIcon || (
                                        <Tooltip title='Back to map'>
                                            <CloseOutlined />
                                        </Tooltip>
                                    )
                                }
                                footer={<DatasetDiscoveryProviderTabsNavigation datasetDiscovery={datasetDiscovery} />}
                            ></PageHeader>
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
                        {visible && <Outlet />}
                    </Drawer>
                }
                innerRouteElement={
                    <DatasetDiscoveryProviderRoute datasetDiscovery={props.datasetDiscovery} datasetExplorer={props.datasetExplorer} />
                }
                pathParamName='providerId'
                routePathStateSelector={() => {
                    return props.datasetDiscovery.selectedProvider?.id;
                }}
                updateStateFromRoutePath={(path) => {
                    props.datasetDiscovery.selectProvider(path);
                }}
                defaultRoute={() => props.datasetDiscovery.providers[0].id}
            />
        </React.Fragment>
    );
};
