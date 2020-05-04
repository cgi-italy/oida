import React from 'react';
import { useObserver } from 'mobx-react';
import { Select } from 'antd';

import { IDatasetVolumetricViz, VOLUMETRIC_VIZ_TYPE } from '@oida/eo';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetColormapPresetSelector } from './dataset-colormap-selector';
import { DatasetVerticalScaleSelector } from './dataset-vertical-scale-selector';
import { DatasetVolumetricViewModeSettingsFactory } from './dataset-volumetric-view-mode-settings-factory';

export type DatasetVolumetricVizSettingsProps = {
    datasetViz: IDatasetVolumetricViz
};

export const DatasetVolumetricVizSettings = (props: DatasetVolumetricVizSettingsProps) => {

    let viewModeSettings: React.ReactNode;

    const viewMode = useObserver(() => {
        return props.datasetViz.mapLayer ? props.datasetViz.mapLayer.viewMode : undefined;
    });

    if (viewMode) {
        viewModeSettings = DatasetVolumetricViewModeSettingsFactory.create(viewMode.mode, {
            viewMode: viewMode
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
                datasetViz={props.datasetViz}
                rangeConfig={props.datasetViz.config.verticalScaleConfig}
            />
            {props.datasetViz.colorMap &&
                <DatasetColormapPresetSelector
                    variables={props.datasetViz.config.colorMapConfig!.variables!}
                    colorMap={props.datasetViz.colorMap}
                    presets={props.datasetViz.config.colorMapConfig!.colorMaps!}
                />
            }
            <div className='volumetric-view-mode'>
                <div className='dataset-combo-selector'>
                    <span>View mode: </span>
                    <Select
                        value={viewMode?.mode}
                        onChange={(value) => props.datasetViz.mapLayer?.setViewMode({
                            mode: value
                        })}
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
