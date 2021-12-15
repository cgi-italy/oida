import React, { useState } from 'react';

import { Slider, Checkbox } from 'antd';
import proj4 from 'proj4';

import { SLICE_VOLUME_VIEW_ID, VolumeTileGrid } from '@oidajs/core';
import { SliceVolumeViewMode } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';


export type DatasetVolumetricSliceViewSettingsProps = {
    viewMode: SliceVolumeViewMode,
    tileGrid: VolumeTileGrid
};

export const DatasetVolumetricSliceViewSettings = (props: DatasetVolumetricSliceViewSettingsProps) => {

    const slices = useSelector(() => {
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

    const srs = props.tileGrid.srs;

    const extent = props.tileGrid.extent;
    const xToLon = (value) => {
        let x = extent.minX + value * (extent.maxX - extent.minX);
        if (srs !== 'EPSG:4326') {
            let outputCoord = proj4(srs, 'EPSG:4326', [x, (extent.minY + extent.maxY) / 2]);
            x = outputCoord[0];
        }
        return `Lon: ${x.toFixed(3)} °`;
    };
    const yToLat = (value) => {
        let y = extent.minY + value * (extent.maxY - extent.minY);
        if (srs !== 'EPSG:4326') {
            let outputCoord = proj4(srs, 'EPSG:4326', [(extent.minX + extent.maxX) / 2, y]);
            y = outputCoord[1];
        }
        return `Lat: ${y.toFixed(3)} °`;
    };

    const zToHeight = (value) => {
        let height = extent.minZ + value * (extent.maxZ - extent.minZ);
        return `Height: ${height.toFixed(3)} m`;
    };

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
                    step={0.005}
                    value={slices.x}
                    tipFormatter={xToLon}
                    onChange={(value) => props.viewMode.setXSlice(value as number)}
                />
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
                    step={0.005}
                    value={slices.y}
                    tipFormatter={yToLat}
                    onChange={(value) => props.viewMode.setYSlice(value as number)}
                />
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
                    step={0.005}
                    value={slices.z}
                    tipFormatter={zToHeight}
                    onChange={(value) => props.viewMode.setZSlice(value as number)}
                />
            </div>
        </div>
    );

};


DatasetVolumetricViewModeSettingsFactory.register(SLICE_VOLUME_VIEW_ID, (config) => {
    return <DatasetVolumetricSliceViewSettings {...config}/>;
});
