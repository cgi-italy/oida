import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetBandPresetSelector } from './dataset-band-preset-selector';
import { DatasetColormapSelector } from './dataset-colormap-selector';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';

import { IDatasetRasterViz } from '@oida/eo';

export type DatasetRasterVizSettingsProps = {
    datasetViz: IDatasetRasterViz
};

export const DatasetRasterVizSettings = (props: DatasetRasterVizSettingsProps) => {

    const bandMathConfig = props.datasetViz.config.bandMathConfig;
    const colorMapConfig = props.datasetViz.config.colorMapConfig;

    return (
        <div>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            {props.datasetViz.bandMath &&
                <DatasetBandPresetSelector
                    rasterView={props.datasetViz}
                    presets={bandMathConfig ? bandMathConfig.presets || [] : []}
                />
            }
            {props.datasetViz.colorMap && colorMapConfig &&
                <React.Fragment>
                    <DatasetColormapSelector
                        variables={props.datasetViz.config.colorMapConfig?.variables}
                        colorMap={props.datasetViz.colorMap}
                        presets={colorMapConfig.colorMaps}
                    />
                </React.Fragment>
            }
        </div>
    );
};

DatasetVizSettingsFactory.register('raster', (config) => {
    return <DatasetRasterVizSettings {...config}/>;
});
