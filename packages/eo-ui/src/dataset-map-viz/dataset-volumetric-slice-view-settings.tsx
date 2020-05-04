import React, { useState } from 'react';
import { useObserver } from 'mobx-react';

import { Slider, Checkbox } from 'antd';

import { SLICE_VOLUME_VIEW_ID } from '@oida/core';
import { ISliceVolumeMode } from '@oida/state-mst';

import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';

export type DatasetVolumetricSliceViewSettingsProps = {
    viewMode: ISliceVolumeMode
};

export const DatasetVolumetricSliceViewSettings = (props: DatasetVolumetricSliceViewSettingsProps) => {

    const slices = useObserver(() => {
        return {
            x: props.viewMode.xSlice,
            y: props.viewMode.ySlice,
            z: props.viewMode.zSlice
        };
    });

    const [prevSlices, setPrevSlices] = useState({
        x: slices.x,
        y: slices.y,
        z: slices.z
    });

    return (
        <div>
            <div className='dataset-volume-slice-selector dataset-slider-selector'>
                <Checkbox checked={slices.x !== undefined} onChange={(evt) => {
                    if (evt.target.checked) {
                        props.viewMode.setXSlice(prevSlices.x !== undefined ? prevSlices.x : 0.5);
                    } else {
                        setPrevSlices({
                            ...prevSlices,
                            x: props.viewMode.xSlice
                        });
                        props.viewMode.setXSlice(undefined);
                    }
                }}>X slice:</Checkbox>
                <Slider
                    disabled={slices.x === undefined}
                    min={0}
                    max={1}
                    step={0.01}
                    value={slices.x}
                    onChange={(value) => props.viewMode.setXSlice(value as number)}
                >
                </Slider>
            </div>
            <div className='dataset-volume-slice-selector dataset-slider-selector'>
                <Checkbox checked={slices.y !== undefined} onChange={(evt) => {
                    if (evt.target.checked) {
                        props.viewMode.setYSlice(prevSlices.y !== undefined ? prevSlices.y : 0.5);
                    } else {
                        setPrevSlices({
                            ...prevSlices,
                            y: props.viewMode.ySlice
                        });
                        props.viewMode.setYSlice(undefined);
                    }
                }}>Y slice:</Checkbox>
                <Slider
                    disabled={slices.y === undefined}
                    min={0}
                    max={1}
                    step={0.01}
                    value={slices.y}
                    onChange={(value) => props.viewMode.setYSlice(value as number)}
                >
                </Slider>
            </div>
            <div className='dataset-volume-slice-selector dataset-slider-selector'>
                <Checkbox checked={slices.z !== undefined} onChange={(evt) => {
                    if (evt.target.checked) {
                        props.viewMode.setZSlice(prevSlices.z !== undefined ? prevSlices.z : 0.5);
                    } else {
                        setPrevSlices({
                            ...prevSlices,
                            z: props.viewMode.zSlice
                        });
                        props.viewMode.setZSlice(undefined);
                    }
                }}>Z slice:</Checkbox>
                <Slider
                    disabled={slices.z === undefined}
                    min={0}
                    max={1}
                    step={0.01}
                    value={slices.z}
                    onChange={(value) => props.viewMode.setZSlice(value as number)}
                >
                </Slider>
            </div>
        </div>
    );

};


DatasetVolumetricViewModeSettingsFactory.register(SLICE_VOLUME_VIEW_ID, (config) => {
    return <DatasetVolumetricSliceViewSettings {...config}/>;
});
