import React from 'react';

import { DatasetConfig } from '@oidajs/eo-mobx';
import { SelectEnumRenderer } from '@oidajs/ui-react-antd';

export type DatasetSelectorProps = {
    datasets: DatasetConfig[];
    value?: string;
    onChange: (value?: string) => void;
};

export const DatasetSelector = (props: DatasetSelectorProps) => {
    const datasetSelectorConfig = {
        choices: props.datasets.map((dataset) => {
            return {
                value: dataset.id,
                name: dataset.name
            };
        })
    };

    return (
        <SelectEnumRenderer
            className='dataset-selector'
            config={datasetSelectorConfig}
            value={props.value}
            placeholder='Select dataset'
            required={true}
            onChange={(value) => props.onChange(value as string)}
        />
    );
};
