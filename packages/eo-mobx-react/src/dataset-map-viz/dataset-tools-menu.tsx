import React from 'react';
import { Button, Dropdown, Menu } from 'antd';

import { DatasetExplorer, DatasetViz, generateComboAnalysisName, ComboAnalysis, DatasetAnalyses, DatasetAnalysis } from '@oida/eo-mobx';

export type DatasetToolsMenuProps = {
    datasetExplorer: DatasetExplorer,
    datasetViz: DatasetViz<any>,
    icon: React.ReactNode,
};

export const DatasetToolsMenu = (props: DatasetToolsMenuProps) => {

    let tools = props.datasetViz.dataset.config.tools || [];

    const onToolClick = (type: string) => {

        let tool = tools.find(tool => tool.type === type);

        if (tool) {
            const analysis = DatasetViz.create({
                vizType: tool.type,
                dataset: props.datasetViz.dataset,
                name: tool.name,
                parent: props.datasetViz,
                config: tool.config
            });
            if (analysis instanceof DatasetAnalysis) {
                props.datasetExplorer.analyses.addAnalysis(analysis, new ComboAnalysis({
                    name: generateComboAnalysisName(tool.name),
                    type: tool.type,
                    parent: props.datasetExplorer.analyses
                }));
            }
        }
    };

    let toolsMenuItems = tools.map((tool) => {
        return (
            <Menu.Item key={tool.type} icon={tool.icon}>
                {tool.name}
            </Menu.Item>
        );
    });

    return (
        <Dropdown
            overlay={
                <Menu onClick={(evt) => onToolClick(evt.key as string)}>
                    {toolsMenuItems}
                </Menu>
            }
        >
            <Button
                size='small'
                type='link'
            >
                {props.icon}
            </Button>
        </Dropdown>
    );
};
