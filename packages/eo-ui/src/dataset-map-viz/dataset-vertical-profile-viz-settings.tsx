import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetColormapPresetSelector } from './dataset-colormap-selector';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetVerticalScaleSelector } from './dataset-vertical-scale-selector';

import { IDatasetVerticalProfileViz } from '@oida/eo';

export type DatasetVerticalProfileVizSettingsProps = {
    datasetViz: IDatasetVerticalProfileViz
};

export const DatasetVerticalProfileVizSettings = (props: DatasetVerticalProfileVizSettingsProps) => {

    return (
        <div>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            <DatasetVerticalScaleSelector
                datasetViz={props.datasetViz}
                rangeConfig={props.datasetViz.config.verticalScaleConfig}
            />
            {props.datasetViz.colorMap &&
                <React.Fragment>
                    <DatasetColormapPresetSelector
                        variables={props.datasetViz.config.colorMapConfig!.variables!}
                        colorMap={props.datasetViz.colorMap}
                        presets={props.datasetViz.config.colorMapConfig!.colorMaps!}
                    />
                </React.Fragment>
            }
        </div>
    );
};

DatasetVizSettingsFactory.register('vertical_profile', (config) => {
    return <DatasetVerticalProfileVizSettings {...config}/>;
});
