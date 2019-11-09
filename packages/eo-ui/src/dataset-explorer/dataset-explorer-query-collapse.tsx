import React from 'react';

import { Collapse, Button, Icon } from 'antd';
import { useObserver } from 'mobx-react-lite';

import { DatasetExplorerQuery, DatasetExplorerQueryProps } from './dataset-explorer-query';

export type DatasetExplorerQueryCollapseProps = DatasetExplorerQueryProps;

export const DatasetExplorerQueryCollapse = (props: DatasetExplorerQueryCollapseProps) => {

    let filterVisible = useObserver(() => {
        return props.explorerState.showFilters;
    });

    return (
        <Collapse
            activeKey={filterVisible ? 'filters' : undefined}
        >
            <Collapse.Panel
                key='filters'
                header=''
                extra={
                <Button
                    shape='circle'
                    type='primary'
                    style={{alignSelf: 'flex-end'}}
                    title={props.explorerState.showFilters ? 'Close filter settings' : 'Show dataset filters'}
                    onClick={() => props.explorerState.setFilterVisibility(!props.explorerState.showFilters)}
                >
                    <Icon type={props.explorerState.showFilters ? 'close' : 'control'}></Icon>
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

