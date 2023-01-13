import React, { useState } from 'react';
import { Modal, ModalProps, Button, Tabs } from 'antd';
import { Outlet } from 'react-router-dom';

import { DatasetExplorerWorkspaceHandler } from '@oidajs/eo-mobx';
import { StatePathRouter, useSelector } from '@oidajs/ui-react-mobx';
import { DatasetExplorerWorkspaceProviderComponent } from './dataset-explorer-workspace-provider';

export type DatasetExplorerWorkspacesModalProps = {
    workspaceHandler: DatasetExplorerWorkspaceHandler;
} & ModalProps;

export const DatasetExplorerWorkspacesModal = (props: DatasetExplorerWorkspacesModalProps) => {
    const { workspaceHandler, ...modalProps } = props;

    const [visible, setVisible] = useState(true);

    const title = workspaceHandler.providers.length === 1 ? workspaceHandler.providers[0].name : 'Map views';

    const tabs = useSelector(() => {
        if (workspaceHandler.providers.length > 1) {
            return (
                <Tabs
                    activeKey={props.workspaceHandler.selectedProvider?.id}
                    onChange={(tab) => {
                        props.workspaceHandler.selectProvider(tab);
                    }}
                    items={workspaceHandler.providers.map((provider) => {
                        return {
                            key: provider.id,
                            label: provider.name
                        };
                    })}
                />
            );
        } else {
            return undefined;
        }
    }, []);

    return (
        <StatePathRouter
            routePathStateSelector={() => workspaceHandler.selectedProvider?.id}
            updateStateFromRoutePath={(providerId) => workspaceHandler.selectProvider(providerId)}
            defaultRoute={() => workspaceHandler.providers[0]?.id}
            pathParamName='workspaceProviderId'
            parentRouteElement={
                <Modal
                    open={visible}
                    onCancel={() => setVisible(false)}
                    title={title}
                    footer={<Button onClick={() => setVisible(false)}>Close</Button>}
                    {...modalProps}
                >
                    {tabs}
                    <Outlet />
                </Modal>
            }
            innerRouteElement={
                <DatasetExplorerWorkspaceProviderComponent
                    workspaceHandler={props.workspaceHandler}
                    onWorkspaceLoaded={() => setVisible(false)}
                />
            }
        />
    );
};
