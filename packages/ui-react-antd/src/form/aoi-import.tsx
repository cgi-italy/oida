import React from 'react';

import { Select, Upload, Button, Tooltip } from 'antd';
import { SelectOutlined, UploadOutlined } from '@ant-design/icons';

import { AoiImportConfig } from '@oidajs/ui-react-core';

import { DataCollectionCompactListItem, DataCollectionList } from '../data-collection';
import { FocusIcon } from '../icons/focus';

export const AoiImportRenderer = (props: AoiImportConfig) => {
    const groupOptions = props.sourceGroups.map((group) => {
        return (
            <Select.Option key={group.id} value={group.id}>
                {group.name}
            </Select.Option>
        );
    });

    const groupAoisProps = props.selectedSourceGroupItems;
    if (groupAoisProps) {
        groupAoisProps.items.itemActions = (item) => {
            const aoiActions = [
                {
                    content: 'Use this area',
                    callback: () => {
                        props.onAoiImportAction(item);
                    },
                    icon: <SelectOutlined />
                }
            ];

            const onAoiCenterOnMapAction = props.onAoiCenterOnMapAction;
            if (onAoiCenterOnMapAction) {
                aoiActions.unshift({
                    content: 'Center on map',
                    callback: () => {
                        onAoiCenterOnMapAction(item);
                    },
                    icon: <FocusIcon />
                });
            }

            return aoiActions;
        };
    }

    const onFileImportAction = props.onFileImportAction;
    return (
        <div className='aoi-import'>
            <div className='aoi-source-selector'>
                <Select
                    size='small'
                    value={props.selectedSourceGroup}
                    placeholder='Select or upload a data source'
                    onChange={(value) => {
                        props.onSourceGroupSelect(value);
                    }}
                >
                    {groupOptions}
                </Select>
                {onFileImportAction && (
                    <Upload
                        customRequest={(options: any) => {
                            onFileImportAction(options.file)
                                .then(() => {
                                    options.onSuccess({}, options.file);
                                })
                                .catch((error) => {
                                    options.onError(error);
                                });
                        }}
                        accept={props.supportedFileTypes.map((fileType) => `.${fileType}`).join(',')}
                        fileList={[]}
                    >
                        <Tooltip title='Upload AOI'>
                            <Button size='small'>
                                <UploadOutlined />
                            </Button>
                        </Tooltip>
                    </Upload>
                )}
            </div>
            {groupAoisProps && (
                <DataCollectionList<any>
                    autoScrollOnSelection={true}
                    content={(item) => {
                        return <DataCollectionCompactListItem title={item.name} />;
                    }}
                    {...groupAoisProps}
                />
            )}
        </div>
    );
};
