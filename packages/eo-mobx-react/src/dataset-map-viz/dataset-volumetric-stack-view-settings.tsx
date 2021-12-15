import React from 'react';

import { Slider } from 'antd';

import { STACK_VOLUME_VIEW_ID } from '@oidajs/core';
import { StackVolumeViewMode } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';


export type DatasetVolumetricStackViewSettingsProps = {
    viewMode: StackVolumeViewMode
};

export const DatasetVolumetricStackViewSettings = (props: DatasetVolumetricStackViewSettingsProps) => {
    const numSlices = useSelector(() => props.viewMode.numSlices);

    return (
        <div className='dataset-volume-slices-selector dataset-slider-selector'>
            <span>Stack size:</span>
            <Slider
                min={4}
                max={50}
                step={1}
                value={numSlices}
                onChange={(value) => props.viewMode.setNumSlices(value as number)}
            />
        </div>
    );

};


DatasetVolumetricViewModeSettingsFactory.register(STACK_VOLUME_VIEW_ID, (config) => {
    return <DatasetVolumetricStackViewSettings {...config}/>;
});
