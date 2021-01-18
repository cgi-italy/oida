import React from 'react';

import { Select, Upload, Button, Tooltip, List } from 'antd';
import { SelectOutlined, UploadOutlined } from '@ant-design/icons';

import { AoiImportConfig } from '@oida/ui-react-core';

import { DataCollectionList } from '../data-collection';
import { FocusIcon } from '../icons/focus';

export const AoiImportRenderer = (props: AoiImportConfig) => {

    let groupOptions = props.sourceGroups.map((group) => {
        return (
            <Select.Option
                key={group.id}
                value={group.id}
            >
                {group.name}
            </Select.Option>
        );
    });

    let groupAoisProps = props.selectedSourceGroupItems;
    if (groupAoisProps) {

        let aoiActions = [{
            name: 'Use this area',
            callback: (aoi) => {
                props.onAoiImportAction(aoi);
            },
            icon: (<SelectOutlined/>)
        }];

        const onAoiCenterOnMapAction = props.onAoiCenterOnMapAction;
        if (onAoiCenterOnMapAction) {
            aoiActions.unshift({
                name: 'Center on map',
                callback: (aoi) => {
                    onAoiCenterOnMapAction(aoi);
                },
                icon: (<FocusIcon/>)
            });
        }

        let itemSelector = groupAoisProps.items.itemSelector;

        groupAoisProps.items.itemSelector = (item) => {
            return {
                ...itemSelector(item),
                actions: aoiActions
            };
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
                {onFileImportAction &&
                    <Upload
                        customRequest={(options: any) => {
                            onFileImportAction(options.file).then(() => {
                                options.onSuccess({}, options.file);
                            }).catch((error) => {
                                options.onError(error);
                            });
                        }}
                        accept={props.supportedFileTypes.map(fileType => `.${fileType}`).join(',')}
                        fileList={[]}
                    >
                        <Tooltip
                            title='Upload AOI'
                        >
                            <Button
                                size='small'
                            >
                                <UploadOutlined/>
                            </Button>
                        </Tooltip>
                    </Upload>
                }
            </div>
            {groupAoisProps && <DataCollectionList<any>
                autoScrollOnSelection={true}
                content={(item) => {
                    return <List.Item.Meta
                        title={item.name}
                    />;
                }}
                {...groupAoisProps}
            />}
        </div>
    );
};

