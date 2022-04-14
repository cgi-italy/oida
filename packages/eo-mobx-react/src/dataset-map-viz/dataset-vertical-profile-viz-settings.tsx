import React from 'react';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';

import { VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz } from '@oidajs/eo-mobx';
import { DatasetBandModeControls } from './dataset-band-mode-controls';
import { DatasetVerticalScaleSelector } from './dataset-vertical-scale-selector';
import { DatasetDimensionValueSelector } from './dataset-dimension-value-selector';

export type DatasetVerticalProfileVizSettingsProps = {
    datasetViz: DatasetVerticalProfileViz;
};

export const DatasetVerticalProfileVizSettings = (props: DatasetVerticalProfileVizSettingsProps) => {
    let dimensionSelectors: JSX.Element[] | undefined;

    if (props.datasetViz.config.dimensions) {
        dimensionSelectors = props.datasetViz.config.dimensions.map((dimension) => {
            return <DatasetDimensionValueSelector dimensionsState={props.datasetViz.dimensions} dimension={dimension} key={dimension.id} />;
        });
    }

    return (
        <div className='dataset-vertical-profile-viz-settins'>
            <DatasetVizOpacityControl datasetViz={props.datasetViz} />
            <DatasetVerticalScaleSelector
                verticalScale={props.datasetViz.verticalScale}
                rangeConfig={props.datasetViz.config.verticalScaleConfig}
            />
            {dimensionSelectors}
            <DatasetBandModeControls bandModeConfig={props.datasetViz.config.bandMode} bandMode={props.datasetViz.bandMode} />
        </div>
    );
};

DatasetVizSettingsFactory.register(VERTICAL_PROFILE_VIZ_TYPE, (config) => {
    return <DatasetVerticalProfileVizSettings {...config} />;
});
