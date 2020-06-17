import React from 'react';

import { DatasetConfig } from '@oida/eo';
import { SelectEnumRenderer } from '@oida/ui-react-antd';


export type DatasetSelectorProps = {
    datasets: DatasetConfig[];
    value?: string;
    onChange: (value?: string) => void;
};

export const DatasetSelector = (props: DatasetSelectorProps) => {

    let datasetSelectorConfig = {
        choices: props.datasets.map((dataset) => {
            return {
                value: dataset.id,
                name: dataset.name
            };
        })
    };

    return (
        <SelectEnumRenderer
            config={datasetSelectorConfig}
            value={props.value}
            placeholder='Select dataset'
            required={true}
            onChange={(value) => props.onChange(value as string)}
        />
    );
};
