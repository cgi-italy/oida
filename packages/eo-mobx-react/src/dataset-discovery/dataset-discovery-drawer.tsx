import React, { useState, useEffect } from 'react';
import { Outlet, useResolvedPath } from 'react-router-dom';
import { Drawer, Button } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { CloseOutlined } from '@ant-design/icons';

import { DatasetDiscovery, DatasetExplorer } from '@oidajs/eo-mobx';
import { BreadcrumbItem, StatePathRouter } from '@oidajs/ui-react-mobx';

import { DatasetDiscoveryProviderTabsSelector, DatasetDiscoveryProviderRoute } from './dataset-discovery-provider-route';

export type DatasetDiscoveryDrawerProps = {
    datasetDiscovery: DatasetDiscovery;
    datasetExplorer: DatasetExplorer;
    title?: React.ReactNode;
    backIcon?: React.ReactNode;
    onClose: () => void;
    closeOnSelection?: boolean;
    providerSelector?: React.ComponentType<{ datasetDiscovery: DatasetDiscovery }>;
} & Omit<DrawerProps, 'visible' | 'onClose' | 'afterVisibleChange'>;

export const DatasetDiscoveryDrawer = (props: DatasetDiscoveryDrawerProps) => {
    const { datasetDiscovery, datasetExplorer, title, backIcon, onClose, closeOnSelection, providerSelector, ...drawerProps } = props;

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        datasetDiscovery.footprintLayer.visible.setValue(true);

        return () => {
            datasetDiscovery.footprintLayer.visible.setValue(false);
        };
    }, []);

    const discoveryPath = useResolvedPath('./');
    const ProviderSelector = providerSelector || DatasetDiscoveryProviderTabsSelector;

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
                            <React.Fragment>
                                <div className='dataset-discovery-drawer-title'>
                                    <Button type='link' icon={<CloseOutlined />} onClick={() => setVisible(false)} />
                                    <div>{props.title || 'Data discovery'}</div>
                                </div>
                                <div className='dataset-discovery-drawer-provider-selector'>
                                    <ProviderSelector datasetDiscovery={datasetDiscovery} />
                                </div>
                            </React.Fragment>
                        }
                        placement='right'
                        closable={false}
                        mask={false}
                        {...drawerProps}
                        open={visible}
                        onClose={() => {
                            setVisible(false);
                        }}
                        afterOpenChange={(visible) => {
                            if (!visible) {
                                props.onClose();
                            }
                        }}
                    >
                        {visible && <Outlet />}
                    </Drawer>
                }
                innerRouteElement={
                    <DatasetDiscoveryProviderRoute
                        datasetDiscovery={props.datasetDiscovery}
                        datasetExplorer={props.datasetExplorer}
                        onDatasetAdd={closeOnSelection ? () => setVisible(false) : undefined}
                    />
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
