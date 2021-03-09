import React from 'react';
import { InputNumber, Slider } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';
import { SliderRangeProps } from 'antd/lib/slider';

import classnames from 'classnames';

import { NumericRangeField, NUMERIC_RANGE_FIELD_ID } from '@oida/core';
import { FormFieldRendererBaseProps } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';


export type NumericRangeFieldRendererProps = FormFieldRendererBaseProps<NumericRangeField> & {
    sliderProps?: Partial<SliderRangeProps>,
    numericInputProps?: Partial<InputNumberProps>
};

export const NumericRangeFieldRenderer = (props: NumericRangeFieldRendererProps) => {

    const {value, onChange, title, required, config, autoFocus, sliderProps, numericInputProps} = props;

    const hasLimits = config.min !== undefined && config.max !== undefined;

    const onRangeChange = (range) => {
        if (range && range.length === 2) {
            onChange({
                from: range[0],
                to: range[1],
            });
        } else {
            onChange(undefined);
        }
    };


    let domainSlider: JSX.Element | undefined;
    if (hasLimits) {
        let marks = {
            [config.min!]: `${config.min}`,
            [config.max!]: `${config.max}`,
        };

        domainSlider = (
            <Slider
                style={{minWidth: '140px'}}
                value={value ? [value.from, value.to] : undefined}
                defaultValue={value ? [value.from, value.to] : [config.min!, config.max!]}
                onChange={onRangeChange}
                min={config.min}
                max={config.max}
                marks={marks}
                tooltipVisible={false}
                step={config.step || ((config.max! - config.min!) / 100)}
                range={true}
                {...sliderProps}
            />
        );
    }

    return (
        <div className={classnames('numeric-range-field', {'with-slider': hasLimits})}>
            <div className='numeric-range-field-inputs'>
                <InputNumber
                    value={value ? value.from : undefined}
                    min={config.min}
                    max={config.max}
                    size='small'
                    step={config.step}
                    formatter={value => `≥ ${value}`}
                    onChange={(minValue) => {
                        if (typeof(minValue) === 'number') {
                            onRangeChange([minValue, value ? value.to : undefined]);
                        }
                    }}
                    {...numericInputProps}
                />
                <InputNumber
                    value={value ? value.to : undefined}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    size='small'
                    formatter={value => `≤ ${value}`}
                    onChange={(maxValue) => {
                        if (typeof(maxValue) === 'number') {
                            onRangeChange([value ? value.from : undefined, maxValue]);
                        }
                    }}
                    {...numericInputProps}
                />
            </div>
            {domainSlider}
        </div>
    );

};

antdFormFieldRendererFactory.register<NumericRangeField>(
    NUMERIC_RANGE_FIELD_ID, 'rangepicker',
    NumericRangeFieldRenderer
);
