import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

import { DatasetExplorerToolsProps, useDatasetExplorerTools } from '../hooks';


export type DatasetExplorerToolsDropdownProps = DatasetExplorerToolsProps & {
    title?: string;
    noDatasetsMessage?: string;
    noToolsMessage?: string;
};

/**
 * A react component that displays as a dropdown a list of analytics tool usable for the
 * datasets currently added to the map
*/
export const DatasetExplorerToolsDropDown = (props: DatasetExplorerToolsDropdownProps) => {

    const explorerTools = useDatasetExplorerTools({
        datasetExplorer: props.datasetExplorer,
        combinedAnalysisTools: props.combinedAnalysisTools
    });

    let menuItems = explorerTools.map((item) => {
        return (
            <Menu.Item
                key={item.id}
                icon={item.icon}
                onClick={() => item.callback()}
            >
                <a>{item.name}</a>
            </Menu.Item>
        );
    });

    if (!props.datasetExplorer.items.length) {
        menuItems = [(
            <Menu.Item disabled={true} className='empty-dropdown-message'>
                {props.noDatasetsMessage || 'No datasets currently on the map. Add some dataset to enable analysis tools.'}
            </Menu.Item>
        )];
    } else if (!menuItems.length) {
        menuItems = [(
            <Menu.Item disabled={true} className='empty-dropdown-message'>
                {props.noToolsMessage || 'No tools available for the current map datasets.'}
            </Menu.Item>
        )];
    }

    return (
        <Dropdown
            trigger={['click']}
            overlay={(
                <Menu
                    selectable={false}
                >
                    <Menu.ItemGroup
                        title={props.title || 'Dataset analytics tools'}
                    >
                        {menuItems}
                    </Menu.ItemGroup>
                </Menu>
            )}>
            <Button icon={<BarChartOutlined/>}>

            </Button>
        </Dropdown>
    );
};
