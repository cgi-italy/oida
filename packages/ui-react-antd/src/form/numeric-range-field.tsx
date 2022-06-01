import React, { useRef } from 'react';
import { InputNumber, Slider } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';
import { SliderRangeProps } from 'antd/lib/slider';

import classnames from 'classnames';

import { NumericRangeField, NUMERIC_RANGE_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type NumericRangeFieldRendererProps = FormFieldRendererBaseProps<NumericRangeField> & {
    sliderProps?: Partial<SliderRangeProps>;
    numericInputProps?: Partial<InputNumberProps>;
    /** Extra content to be displayed between the two range inputs */
    inputInfraContent?: React.ReactNode;
    /** Extra content to be displayed on the right of the range selection slider */
    sliderExtraContent?: React.ReactNode;
};

export const NumericRangeFieldRenderer = (props: NumericRangeFieldRendererProps) => {
    const sliderRef = useRef<any>();

    const { value, onChange, config, readonly, disabled, sliderProps, numericInputProps } = props;

    const hasLimits = config.min !== undefined && config.max !== undefined;

    const onRangeChange = (range) => {
        if (range && range.length === 2) {
            onChange({
                from: range[0],
                to: range[1]
            });
        } else {
            onChange(undefined);
        }
    };

    let domainSlider: JSX.Element | undefined;
    if (hasLimits) {
        const marks = {
            [config.min!]: `${config.min}`,
            [config.max!]: `${config.max}`
        };

        domainSlider = (
            <Slider
                ref={sliderRef}
                value={value ? [value.from, value.to] : undefined}
                defaultValue={value ? [value.from, value.to] : [config.min!, config.max!]}
                onChange={(range) => {
                    if (sliderRef.current) {
                        // retrieve from the slider state which handle was moved and update only the corresponding range endpoint
                        // (to avoid rounding-off the untouched range endpoint)
                        const movedHandle: number | undefined = sliderRef.current.prevMovedHandleIndex;
                        if (movedHandle === 0) {
                            range[1] = value?.to || range[1];
                        } else if (movedHandle === 1) {
                            range[0] = value?.from || range[0];
                        }
                    }
                    onRangeChange(range);
                }}
                min={config.min}
                max={config.max}
                marks={marks}
                tooltipVisible={false}
                step={config.step || parseFloat(((config.max! - config.min!) / 100).toPrecision(4))}
                range={true}
                disabled={disabled || readonly}
                {...sliderProps}
            />
        );
    }

    return (
        <div className={classnames('numeric-range-field', { 'with-slider': hasLimits })}>
            <div className='numeric-range-field-inputs'>
                <InputNumber
                    value={value ? value.from : undefined}
                    min={config.min}
                    max={config.max}
                    size='small'
                    step={config.step}
                    formatter={(value) => `≥ ${value}`}
                    onChange={(minValue) => {
                        if (typeof minValue === 'number') {
                            onRangeChange([minValue, value ? value.to : undefined]);
                        }
                    }}
                    readOnly={readonly}
                    disabled={disabled}
                    {...numericInputProps}
                />
                {props.inputInfraContent}
                <InputNumber
                    value={value ? value.to : undefined}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    size='small'
                    formatter={(value) => `≤ ${value}`}
                    onChange={(maxValue) => {
                        if (typeof maxValue === 'number') {
                            onRangeChange([value ? value.from : undefined, maxValue]);
                        }
                    }}
                    readOnly={readonly}
                    disabled={disabled}
                    {...numericInputProps}
                />
            </div>
            <div className='numeric-range-slider'>
                {domainSlider}
                {props.sliderExtraContent}
            </div>
        </div>
    );
};

antdFormFieldRendererFactory.register<NumericRangeField>(NUMERIC_RANGE_FIELD_ID, 'rangepicker', NumericRangeFieldRenderer);
