import React from 'react';

import { useSelector } from '@oidajs/ui-react-mobx';
import { VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz, DatasetDimensions, DatasetDimension, DataDomain } from '@oidajs/eo-mobx';

import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetBandModeControls } from './dataset-band-mode-controls';
import { DatasetVerticalScaleSelector } from './dataset-vertical-scale-selector';
import { DatasetDimensionValueSelector } from './dataset-dimension-value-selector';
import { DatasetDimensionRangeSelector } from './dataset-dimension-range-selector';

type VerticalProfileDimensionRangeSelectorProps = {
    dimensionsState: DatasetDimensions;
    dimension: DatasetDimension<DataDomain<number | string | Date>>;
};

const VerticalProfileDimensionRangeSelector = (props: VerticalProfileDimensionRangeSelectorProps) => {
    const domain = useSelector(() => props.dimensionsState.getDimensionDomain(props.dimension.id));

    const dimension = {
        ...props.dimension,
        domain: domain
    };

    const value = useSelector(() => {
        let range = props.dimensionsState.ranges.get(dimension.id);
        if (!range) {
            const value = props.dimensionsState.values.get(dimension.id);
            if (value) {
                range = [value];
            }
        }
        return range;
    });

    return (
        <DatasetDimensionRangeSelector
            dimension={dimension}
            onChange={(value) => {
                if (value) {
                    props.dimensionsState.setRange(dimension.id, value);
                } else {
                    props.dimensionsState.unsetRange(dimension.id);
                }
            }}
            allowRangeSelection={true}
            value={value}
        />
    );
};

export type DatasetVerticalProfileVizSettingsProps = {
    datasetViz: DatasetVerticalProfileViz;
};

export const DatasetVerticalProfileVizSettings = (props: DatasetVerticalProfileVizSettingsProps) => {
    let dimensionSelectors: JSX.Element[] | undefined;

    if (props.datasetViz.config.dimensions) {
        dimensionSelectors = props.datasetViz.config.dimensions.map((dimension) => {
            if (dimension.allowRange) {
                return (
                    <VerticalProfileDimensionRangeSelector
                        dimensionsState={props.datasetViz.dimensions}
                        dimension={dimension}
                        key={dimension.id}
                    />
                );
            } else {
                return (
                    <DatasetDimensionValueSelector dimensionsState={props.datasetViz.dimensions} dimension={dimension} key={dimension.id} />
                );
            }
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
