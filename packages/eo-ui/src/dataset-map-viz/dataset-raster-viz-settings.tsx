import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetBandPresetSelector } from './dataset-band-preset-selector';
import { DatasetColormapPresetSelector } from './dataset-colormap-selector';

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
            {props.datasetViz.bandMath &&
                <DatasetBandPresetSelector
                    rasterView={props.datasetViz}
                    presets={bandMathConfig ? bandMathConfig.presets || [] : []}
                />
            }
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

DatasetVizSettingsFactory.register('raster', (config) => {
    return <DatasetRasterVizSettings {...config}/>;
});
