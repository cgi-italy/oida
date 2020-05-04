import React from 'react';
import { useObserver } from 'mobx-react';

import { Slider } from 'antd';

import { STACK_VOLUME_VIEW_ID } from '@oida/core';
import { IStackVolumeMode } from '@oida/state-mst';

import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';

export type DatasetVolumetricStackViewSettingsProps = {
    viewMode: IStackVolumeMode
};

export const DatasetVolumetricStackViewSettings = (props: DatasetVolumetricStackViewSettingsProps) => {
    const numSlices = useObserver(() => props.viewMode.numSlices);

    return (
        <div className='dataset-volume-slices-selector dataset-slider-selector'>
            <span>Stack size:</span>
            <Slider
                min={4}
                max={50}
                step={1}
                value={numSlices}
                onChange={(value) => props.viewMode.setNumSlices(value as number)}
            >
            </Slider>
        </div>
    );

};


DatasetVolumetricViewModeSettingsFactory.register(STACK_VOLUME_VIEW_ID, (config) => {
    return <DatasetVolumetricStackViewSettings {...config}/>;
});
