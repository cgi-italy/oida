import React from 'react';
import { Button, Dropdown } from 'antd';
import { MenuItemType } from 'antd/lib/menu/hooks/useItems';

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

    const toolsMenuItems: MenuItemType[] = tools.map((tool) => {
        return {
            key: tool.id,
            icon: tool.icon,
            onClick: () => tool.callback(),
            label: tool.name
        };
    });

    return (
        <Dropdown menu={{ items: toolsMenuItems }}>
            <Button size='small' type='link'>
                {props.icon}
            </Button>
        </Dropdown>
    );
};
