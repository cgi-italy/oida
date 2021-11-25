import React from 'react';

import { Map } from '@oida/state-mobx';
import { RasterMapViz, RASTER_VIZ_TYPE } from '@oida/eo-mobx';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetDimensionValueSelector } from './dataset-dimension-value-selector';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetBandModeControls } from './dataset-band-mode-controls';


export type DatasetRasterVizSettingsProps = {
    datasetViz: RasterMapViz;
    mapState?: Map;
};

export const DatasetRasterVizSettings = (props: DatasetRasterVizSettingsProps) => {

    let dimensionSelectors: JSX.Element[] | undefined;

    if (props.datasetViz.config.dimensions) {
        dimensionSelectors = props.datasetViz.config.dimensions
            .map((dimension) => {
                return (
                    <DatasetDimensionValueSelector
                        dimensionsState={props.datasetViz.dimensions}
                        dimension={dimension}
                        key={dimension.id}
                    />
                );
            });
    }

    return (
        <div className='dataset-raster-viz-settins'>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            {dimensionSelectors}
            <DatasetBandModeControls
                bandModeConfig={props.datasetViz.config.bandMode}
                bandMode={props.datasetViz.bandMode}
                dimensionsState={props.datasetViz.dimensions}
                mapState={props.mapState}
            />
        </div>
    );
};

DatasetVizSettingsFactory.register(RASTER_VIZ_TYPE, (config) => {
    return <DatasetRasterVizSettings {...config}/>;
});
