import React from 'react';

import { useObserver } from 'mobx-react';

import { Slider } from 'antd';

import { IDatasetVerticalProfileViz, IDatasetVolumetricViz } from '@oida/eo';

export type DatasetVerticalScaleSelectorProps = {
    datasetViz: IDatasetVerticalProfileViz | IDatasetVolumetricViz;
    rangeConfig: {
        min: number,
        max: number,
        step?: number
    }
};

export const DatasetVerticalScaleSelector = (props: DatasetVerticalScaleSelectorProps) => {

    let verticalScale = useObserver(() => {
        return props.datasetViz.verticalScale;
    });

    let range = props.rangeConfig!;

    let marks = {
        [range.min]: `${range.min}x`,
        [range.max]: `${range.max}x`,
    };

    return (
        <div className='dataset-vertical-scale-selector dataset-slider-selector has-marks'>
            <span>Vertical scale:</span>
            <Slider
                min={range.min}
                max={range.max}
                step={range.step || 1}
                value={verticalScale}
                marks={marks}
                onChange={(value) => props.datasetViz.setVerticalScale(value as number)}
                tipFormatter={(value) => `${value}x`}
            >
            </Slider>
        </div>
    );

};

DatasetVerticalScaleSelector.defaultProps = {
    rangeConfig: {
        min: 1,
        max: 100,
        step: 1
    }
};
