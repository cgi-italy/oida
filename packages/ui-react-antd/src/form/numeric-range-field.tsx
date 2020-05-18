import React from 'react';

import { InputNumber, Slider, Row, Col } from 'antd';

import { NumericRangeField, NUMERIC_RANGE_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const NumericRangeFieldRenderer = (props: Omit<NumericRangeField, 'name' | 'type'>) => {

    let { value, onChange, config, rendererConfig } = props;

    let hasLimits = config.min !== undefined && config.max !== undefined;


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


    let renderProps = rendererConfig ? rendererConfig.props : {};

    return (
        <React.Fragment>
            {hasLimits &&
                <Slider
                    style={{minWidth: '140px'}}
                    value={value ? [value.from, value.to] : undefined}
                    onChange={onRangeChange}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    range={true}
                    {...renderProps}
                />
            }
            {!hasLimits &&
                <React.Fragment>
                    <InputNumber
                        size='small'
                        value={value ? value.from : undefined}
                        min={config.min}
                        max={config.max}
                        onChange={(minValue) => {
                            if (typeof(minValue) === 'number') {
                                onRangeChange([minValue, value ? Math.max(minValue, value.to) : minValue]);
                            }
                        }}
                        step={config.step}
                        {...renderProps}
                    />
                    <span> - </span>
                    <InputNumber
                        size='small'
                        value={value ? value.to : undefined}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        onChange={(maxValue) => {
                            if (typeof(maxValue) === 'number') {
                                onRangeChange([value ? Math.min(value.from, maxValue) : maxValue, maxValue]);
                            }
                        }}
                        {...renderProps}
                    />
                </React.Fragment>
            }
        </React.Fragment>
    );

};

antdFormFieldRendererFactory.register<NumericRangeField>(
    NUMERIC_RANGE_FIELD_ID, 'rangepicker',
    NumericRangeFieldRenderer
);
