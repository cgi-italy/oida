import React from 'react';
import { getParentOfType } from 'mobx-state-tree';

import { Button, Tooltip } from 'antd';

import { IDataset, DatasetsExplorer, DatasetViz, DatasetAnalysis } from '@oida/eo';

export type DatasetToolsProps = {
    dataset: IDataset
};

export const DatasetTools = (props: DatasetToolsProps) => {

    let tools = props.dataset.config.tools || [];
    let datasetExplorer = getParentOfType(props.dataset, DatasetsExplorer);

    let toolsButtons = tools.map((tool) => {
        return (
            <Tooltip
                title={tool.name}
                key={tool.type}
            >
                <Button
                    onClick={() => {
                        let DatasetVizType = DatasetViz.getSpecificType(tool.type);
                        if (DatasetVizType) {
                            let datasetViz = DatasetVizType.create({
                                dataset: props.dataset.id,
                                config: tool.config,
                                name: tool.name
                            });

                            datasetExplorer.analyses.collection.add({
                                datasetViz: datasetViz,
                                id: `${datasetViz.id}analysis`
                            });
                        }
                    }}
                >{tool.icon} {tool.name}
                </Button>
            </Tooltip>
        );
    });

    return (
        <div>
            {toolsButtons}
        </div>
    );
};
