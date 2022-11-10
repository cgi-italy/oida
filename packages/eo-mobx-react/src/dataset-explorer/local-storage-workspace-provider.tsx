import React from 'react';
import { PictureOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

import { IFormFieldDefinition, STRING_FIELD_ID } from '@oidajs/core';
import { useEntityCollection } from '@oidajs/ui-react-mobx';
import { DataCollectionDetailedListItem, DataCollectionList } from '@oidajs/ui-react-antd';
import { LocalStorageDatasetExplorerWorkspaceProvider, LOCAL_STORAGE_DATASET_EXPLORER_MAP_VIEW_PROVIDER_TYPE } from '@oidajs/eo-mobx';

import {
    DatasetExplorerWorkspaceProviderFactory,
    DatasetExplorerWorkspaceProviderProps
} from './dataset-explorer-workspace-provider-factory';

export const LocalStorageWorkspaceProvider = (props: DatasetExplorerWorkspaceProviderProps) => {
    const provider = props.provider as LocalStorageDatasetExplorerWorkspaceProvider;

    const filters: IFormFieldDefinition[] = [
        {
            type: STRING_FIELD_ID,
            name: 'search',
            title: 'Search',
            config: {}
        }
    ];

    const listProps = useEntityCollection({
        items: provider.workspaces,
        queryParams: provider.queryParams,
        sortableFields: [{ key: 'name', name: 'Name' }],
        filtering: {
            filters: filters,
            mainFilter: 'search'
        },
        actions: [
            {
                content: 'Load',
                icon: <DownloadOutlined />,
                callback: (item) => {
                    return props.workspaceHandler.setWorkspaceConfig(item.metadata.config).then(() => {
                        props.workspaceHandler.setCurrentWorkspace(item.metadata);
                        if (props.onWorkspaceLoaded) {
                            props.onWorkspaceLoaded();
                        }
                    });
                }
            },
            {
                content: 'Delete',
                icon: <DeleteOutlined />,
                callback: (item) => {
                    props.provider.deleteWorkspace(item.metadata.id);
                    const currentWorkspace = props.workspaceHandler.currentWorkspace;
                    if (currentWorkspace) {
                        if (currentWorkspace.provider === props.provider.id && currentWorkspace.id === item.metadata.id) {
                            props.workspaceHandler.setCurrentWorkspace(undefined);
                        }
                    }
                }
            }
        ]
    });

    if (!listProps) {
        return null;
    }

    return (
        <DataCollectionList
            content={(item) => {
                return (
                    <DataCollectionDetailedListItem
                        title={item.metadata.name}
                        description={item.metadata.description}
                        icon={<PictureOutlined />}
                    />
                );
            }}
            itemLayout='vertical'
            {...listProps}
        />
    );
};

DatasetExplorerWorkspaceProviderFactory.register(LOCAL_STORAGE_DATASET_EXPLORER_MAP_VIEW_PROVIDER_TYPE, (props) => {
    return <LocalStorageWorkspaceProvider {...props} />;
});
