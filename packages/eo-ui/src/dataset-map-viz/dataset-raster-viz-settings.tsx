import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetMultiBandControls } from './dataset-multiband-controls';
import { DatasetColormapSelector } from './dataset-colormap-selector';
import { DatasetDimensionValueSelector } from './dataset-dimension-value-selector';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';

import { IDatasetRasterViz } from '@oida/eo';

export type DatasetRasterVizSettingsProps = {
    datasetViz: IDatasetRasterViz
};

export const DatasetRasterVizSettings = (props: DatasetRasterVizSettingsProps) => {

    const bandMathConfig = props.datasetViz.config.bandMathConfig;
    const colorMapConfig = props.datasetViz.config.colorMapConfig;

    let dimensionSelectors: JSX.Element[] | undefined;

    if (props.datasetViz.config.dimensions) {
        dimensionSelectors = props.datasetViz.config.dimensions
            .map((dimension) => {
                return (
                    <DatasetDimensionValueSelector
                        dimensionsState={props.datasetViz}
                        dimension={dimension}
                        key={dimension.id}
                    />
                );
            });
    }

    return (
        <div>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            {dimensionSelectors}
            {props.datasetViz.bandMath &&
                <DatasetMultiBandControls
                    dataset={props.datasetViz}
                    bandMathConfig={bandMathConfig!}
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
