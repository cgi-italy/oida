import React from 'react';

import { useObserver } from 'mobx-react';

import { Slider } from 'antd';

import { IDatasetViz } from '@oida/eo';

export type WithGain = {
    gain: number,
    setGain: (gain: number) => void;
};

export type DatasetVizOpacityControlProps = {
    datasetViz: WithGain,
    range?: number[]
};

export const DatasetGainControl = (props: DatasetVizOpacityControlProps) => {

    let gain = useObserver(() => props.datasetViz.gain);

    return (
        <div className='dataset-gain-control dataset-slider-selector'>
            <span>Gain:</span>
            <Slider
                value={gain}
                onChange={(value) => props.datasetViz.setGain(value as number)}
                min={props.range ? props.range[0] : 0.1}
                max={props.range ? props.range[1] : 16}
                step={0.1}
            />
        </div>
    );

};
