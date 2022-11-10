import React from 'react';
import { Button, Dropdown, Menu } from 'antd';

import { DatasetExplorer, DatasetViz } from '@oidajs/eo-mobx';
import { ComboToolConfig, useDatasetExplorerTools } from '../hooks';

export type DatasetToolsMenuProps = {
    datasetExplorer: DatasetExplorer;
    analyticsTools: ComboToolConfig[];
    datasetViz: DatasetViz<string, any>;
    icon: React.ReactNode;
};

export const DatasetToolsMenu = (props: DatasetToolsMenuProps) => {
    const tools = useDatasetExplorerTools({
        datasetExplorer: props.datasetExplorer,
        dataset: props.datasetViz.dataset,
        combinedAnalysisTools: props.analyticsTools
    });

    if (!tools.length) {
        return null;
    }

    const toolsMenuItems = tools.map((tool) => {
        return (
            <Menu.Item key={tool.id} icon={tool.icon} onClick={() => tool.callback()}>
                {tool.name}
            </Menu.Item>
        );
    });

    return (
        <Dropdown overlay={<Menu>{toolsMenuItems}</Menu>}>
            <Button size='small' type='link'>
                {props.icon}
            </Button>
        </Dropdown>
    );
};
