import React from 'react';

import { useObserver } from 'mobx-react';

import { Slider } from 'antd';

import { IDatasetVolumeViz, DataVerticalDomain } from '@oida/eo';

export type DatasetVolumeStackSelectorProps = {
    volumeViz: IDatasetVolumeViz;
    verticalDomain: DataVerticalDomain;
};

export const DatasetVolumeStackSelector = (props: DatasetVolumeStackSelectorProps) => {

    let slice = useObserver(() => {
        let vStack = props.volumeViz.verticalStack;
        if (vStack) {
            return vStack.min;
        } else {
            return 0;
        }
    });

    let domainName = 'Height';
    let domainUnits = 'm';

    let marks = {
        [props.verticalDomain.min]: `${props.verticalDomain.min} ${domainUnits}`,
        [props.verticalDomain.max]: `${props.verticalDomain.max} ${domainUnits}`,
    };

    return (
        <div className='dataset-volume-stack-selector'>
            <span>{domainName}:</span>
            <Slider
                min={props.verticalDomain.min}
                max={props.verticalDomain.max}
                step={props.verticalDomain.step}
                value={slice}
                marks={marks}
                onChange={(value) => props.volumeViz.setVerticalStack({min: value as number})}
                tipFormatter={(value) => `${value} ${domainUnits}`}
            >
            </Slider>
        </div>
    );

};
