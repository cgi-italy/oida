import React from 'react';

import { Popover, Button } from 'antd';
import { CloseOutlined, ControlOutlined } from '@ant-design/icons';


import { DatasetExplorerQuery, DatasetExplorerQueryProps } from './dataset-explorer-query';

export type DatasetExplorerQueryPopoverProps = {
    container?: any
    visible: boolean;
    setVisible: (visible: boolean) => void
} & DatasetExplorerQueryProps;

export const DatasetExplorerQueryPopover = (props: DatasetExplorerQueryPopoverProps) => {

    return (
        <Popover
            overlayClassName='dataset-explorer-query-popover'
            content={(
                <DatasetExplorerQuery
                    discoveryState={props.discoveryState}
                    explorerState={props.explorerState}
                    filters={props.filters}
                />
            )}
            trigger='click'
            placement='rightTop'
            visible={props.visible}
            getPopupContainer={() => {
                return (props.container && props.container.current) ? props.container.current : document.body;
            }}
            destroyTooltipOnHide={true}
        >
            <Button
                shape='circle'
                type='primary'
                style={{alignSelf: 'flex-end'}}
                title={props.visible ? 'Close filter settings' : 'Show dataset filters'}
                onClick={() => props.setVisible(!props.visible)}
            >
               {props.visible ? <CloseOutlined/> : <ControlOutlined/>}
            </Button>
        </Popover>

    );
};

DatasetExplorerQueryPopover.defaultProps = {
    container: document.body
};
