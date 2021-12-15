import React from 'react';

import { useSelector } from '@oidajs/ui-react-mobx';

import { Slider } from 'antd';

import { VerticalScale } from '@oidajs/eo-mobx';

export type DatasetVerticalScaleSelectorProps = {
    verticalScale: VerticalScale
    rangeConfig: {
        min: number,
        max: number,
        step?: number
    }
};

export const DatasetVerticalScaleSelector = (props: DatasetVerticalScaleSelectorProps) => {

    let verticalScale = useSelector(() => {
        return props.verticalScale.value;
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
                onChange={(value) => props.verticalScale.setValue(value as number)}
                tipFormatter={(value) => `${value}x`}
            />
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
