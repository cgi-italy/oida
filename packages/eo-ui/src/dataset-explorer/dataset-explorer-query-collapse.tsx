import React from 'react';

import { Collapse, Button } from 'antd';
import { CloseOutlined, ControlOutlined } from '@ant-design/icons';

import { DatasetExplorerQuery, DatasetExplorerQueryProps } from './dataset-explorer-query';

export type DatasetExplorerQueryCollapseProps = DatasetExplorerQueryProps & {
    visible: boolean;
    setVisible: (visible: boolean) => void
};

export const DatasetExplorerQueryCollapse = (props: DatasetExplorerQueryCollapseProps) => {


    return (
        <Collapse
            activeKey={props.visible ? 'filters' : undefined}
        >
            <Collapse.Panel
                key='filters'
                header=''
                extra={
                <Button
                    shape='circle'
                    type='primary'
                    style={{alignSelf: 'flex-end'}}
                    title={props.visible ? 'Close filter settings' : 'Show dataset filters'}
                    onClick={() => props.setVisible(!props.visible)}
                >
                    {props.visible ? <CloseOutlined/> : <ControlOutlined/>}
                </Button>
                }
            >

                <DatasetExplorerQuery
                    {...props}
                />
            </Collapse.Panel>
        </Collapse>
    );
};

