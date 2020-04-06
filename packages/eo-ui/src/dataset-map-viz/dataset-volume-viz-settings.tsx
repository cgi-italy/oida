import React from 'react';

import { Divider } from 'antd';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';

import { IDatasetVolumeViz } from '@oida/eo';

import { DatasetVolumeStackSelector } from './dataset-volume-stack-selector';
import { DatasetColormapPresetSelector } from './dataset-colormap-selector';

export type DatasetVolumeVizSettingsProps = {
    datasetViz: IDatasetVolumeViz
};

export const DatasetVolumeVizSettings = (props: DatasetVolumeVizSettingsProps) => {

    return (
        <div>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            <DatasetVolumeStackSelector
                volumeViz={props.datasetViz}
                verticalDomain={props.datasetViz.config!.verticalDomain}
            />
            {props.datasetViz.colorMap &&
                <DatasetColormapPresetSelector
                    variables={props.datasetViz.config.colorMapConfig!.variables!}
                    colorMap={props.datasetViz.colorMap}
                    presets={props.datasetViz.config.colorMapConfig!.colorMaps!}
                />
            }
        </div>
    );
};

DatasetVizSettingsFactory.register('volume', (config) => {
    return <DatasetVolumeVizSettings {...config}/>;
});
