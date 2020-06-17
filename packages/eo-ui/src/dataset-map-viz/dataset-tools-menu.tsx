import React from 'react';
import { getParentOfType } from 'mobx-state-tree';

import { Button, Dropdown, Menu } from 'antd';

import { IDatasetViz, DatasetsExplorer, DatasetViz } from '@oida/eo';

export type DatasetToolsMenuProps = {
    datasetViz: IDatasetViz,
    icon: React.ReactNode,
};

export const DatasetToolsMenu = (props: DatasetToolsMenuProps) => {

    let tools = props.datasetViz.dataset.config.tools || [];
    let datasetExplorer = getParentOfType(props.datasetViz, DatasetsExplorer);

    const onToolClick = (type: string) => {

        let tool = tools.find(tool => tool.type === type);

        if (tool) {
            let DatasetVizType = DatasetViz.getSpecificType(tool.type);
            if (DatasetVizType) {
                let datasetViz = DatasetVizType.create({
                    dataset: props.datasetViz.dataset.id,
                    config: tool.config,
                    name: tool.name,
                    parent: props.datasetViz.id
                });

                datasetExplorer.analyses.addAnalysis({
                    datasetViz: datasetViz,
                    id: `${datasetViz.id}analysis`
                }, {
                    id: `${datasetViz.id}analysisEnsemble`,
                    type: tool.type,
                    name: tool.name
                });
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
                <Menu onClick={(evt) => onToolClick(evt.key)}>
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
