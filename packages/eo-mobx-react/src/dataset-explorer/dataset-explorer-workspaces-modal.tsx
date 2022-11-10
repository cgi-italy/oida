import React, { useState } from 'react';
import { Modal, ModalProps, Button } from 'antd';
import { Outlet } from 'react-router-dom';

import { DatasetExplorerWorkspaceHandler } from '@oidajs/eo-mobx';
import { StatePathRouter } from '@oidajs/ui-react-mobx';
import { DatasetExplorerWorkspaceProviderComponent } from './dataset-explorer-workspace-provider';

export type DatasetExplorerWorkspacesModalProps = {
    workspaceHandler: DatasetExplorerWorkspaceHandler;
} & ModalProps;

export const DatasetExplorerWorkspacesModal = (props: DatasetExplorerWorkspacesModalProps) => {
    const { workspaceHandler, ...modalProps } = props;

    const [visible, setVisible] = useState(true);

    const title = workspaceHandler.providers.length === 1 ? workspaceHandler.providers[0].name : 'Map views';

    return (
        <StatePathRouter
            routePathStateSelector={() => workspaceHandler.selectedProvider?.id}
            updateStateFromRoutePath={(providerId) => workspaceHandler.selectProvider(providerId)}
            defaultRoute={() => workspaceHandler.providers[0]?.id}
            pathParamName='workspaceProviderId'
            parentRouteElement={
                <Modal
                    visible={visible}
                    onCancel={() => setVisible(false)}
                    title={title}
                    footer={<Button onClick={() => setVisible(false)}>Close</Button>}
                    {...modalProps}
                >
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
