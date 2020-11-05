import React, { useState } from 'react';

import { Select } from 'antd';

import { DatasetVolumetricViz, VOLUMETRIC_VIZ_TYPE } from '@oida/eo-mobx';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetBandSingleSelector } from './dataset-band-single-selector';
import { DatasetVerticalScaleSelector } from './dataset-vertical-scale-selector';
import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';
import { useSelector } from '@oida/ui-react-mobx';
import { StackVolumeViewMode, SliceVolumeViewMode } from '@oida/state-mobx';

export type DatasetVolumetricVizSettingsProps = {
    datasetViz: DatasetVolumetricViz
};

export const DatasetVolumetricVizSettings = (props: DatasetVolumetricVizSettingsProps) => {

    let [viewModeSnapshot, setViewModeSnapshot] = useState({
        stackView: new StackVolumeViewMode({
            numSlices: 8
        }),
        sliceView: new SliceVolumeViewMode({
            zSlice: 0
        })
    });

    let viewModeSettings: React.ReactNode;

    const viewMode = useSelector(() => {
        return props.datasetViz.mapLayer.viewMode;
    });


    if (viewMode) {
        viewModeSettings = DatasetVolumetricViewModeSettingsFactory.create(viewMode.mode, {
            viewMode: viewMode,
            tileGrid: props.datasetViz.mapLayer?.source?.tileGrid
        });
    }

    let viewModeOptions = [
        (<Select.Option key='stackView' value='stackView'>Image stack</Select.Option>),
        (<Select.Option key='sliceView' value='sliceView'>Volume slice</Select.Option>)
    ];

    return (
        <div className='volumetric-viz-settings'>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            <DatasetVerticalScaleSelector
                verticalScale={props.datasetViz.verticalScale}
                rangeConfig={props.datasetViz.config.verticalScaleConfig}
            />
            {props.datasetViz.bandMode &&
                <DatasetBandSingleSelector
                    rasterBands={props.datasetViz.config.bands}
                    state={props.datasetViz.bandMode}
                    bandSelectorLabel='Variable'
                />
            }
            <div className='volumetric-view-mode'>
                <div className='dataset-combo-selector'>
                    <span>View mode: </span>
                    <Select
                        value={viewMode?.mode}
                        onChange={(value) => {
                            if (props.datasetViz.mapLayer) {
                                let currentViewMode = props.datasetViz.mapLayer.viewMode;
                                setViewModeSnapshot({
                                    ...viewModeSnapshot,
                                    [currentViewMode.mode]: currentViewMode
                                });
                                props.datasetViz.mapLayer.setViewMode(viewModeSnapshot[value]);
                            }
                        }}
                    >
                        {viewModeOptions}
                    </Select>
                </div>
                <div className='volumetric-view-mode-settings'>
                    {viewModeSettings}
                </div>
            </div>
        </div>
    );
};

DatasetVizSettingsFactory.register(VOLUMETRIC_VIZ_TYPE, (config) => {
    return <DatasetVolumetricVizSettings {...config}/>;
});
