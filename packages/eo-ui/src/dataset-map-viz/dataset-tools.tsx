import React from 'react';
import { getParentOfType } from 'mobx-state-tree';

import { Button } from 'antd';

import { IDataset, DatasetsExplorer, DatasetAnalysis } from '@oida/eo';

export type DatasetToolsProps = {
    dataset: IDataset
};


const gerateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const DatasetTools = (props: DatasetToolsProps) => {

    let tools = props.dataset.config.tools || [];
    let datasetExplorer = getParentOfType(props.dataset, DatasetsExplorer);

    let toolsButtons = tools.map((tool) => {
        return <Button
            key={tool.type}
            onClick={() => {
                let AnalysisType = DatasetAnalysis.getSpecificType(tool.type);
                if (AnalysisType) {
                    let analysis = AnalysisType.create({
                        id: gerateRandomId(),
                        dataset: props.dataset.id
                    });
                    analysis.init(tool.config);

                    datasetExplorer.analyses.collection.add(analysis);
                }
            }}
        >{tool.type}</Button>;
    });

    return (
        <div>
            {toolsButtons}
        </div>
    );
};
