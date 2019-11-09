import React from 'react';

import { Popover, Button, Icon } from 'antd';
import { useObserver } from 'mobx-react-lite';


import { DatasetExplorerQuery, DatasetExplorerQueryProps } from './dataset-explorer-query';

export type DatasetExplorerQueryPopoverProps = {
    container?: any
    visible: boolean;
    setVisible: (visible: boolean) => void
} & DatasetExplorerQueryProps;

export const DatasetExplorerQueryPopover = (props: DatasetExplorerQueryPopoverProps) => {

    return (
        <Popover
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
                <Icon type={props.visible ? 'close' : 'control'}></Icon>
            </Button>
        </Popover>

    );
};

DatasetExplorerQueryPopover.defaultProps = {
    container: document.body
};
