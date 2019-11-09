import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetBandPresetSelector } from './dataset-band-preset-selector';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';

import { IDatasetRasterViz, IDatasetMapViz } from '@oida/eo';

export type DatasetRasterVizSettingsProps = {
    datasetViz: IDatasetRasterViz
};

export const DatasetRasterVizSettings = (props: DatasetRasterVizSettingsProps) => {

    let bandMathConfig = props.datasetViz.config!.bandMathConfig;

    return (
        <div>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz as IDatasetMapViz}
            />
            <DatasetBandPresetSelector
                rasterView={props.datasetViz}
                presets={bandMathConfig ? bandMathConfig.presets || [] : []}
            />
        </div>
    );
};

DatasetVizSettingsFactory.register('raster', (config) => {
    return <DatasetRasterVizSettings {...config}/>;
});
