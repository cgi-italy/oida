import React, { useState, useEffect } from 'react';

import { InputNumber, Slider } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';

import { NumericField, NUMERIC_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type NumericFieldRendererProps = {
    changeDelay?: number;
    useSlider?: boolean;
} & Omit<InputNumberProps, 'onChange' | 'onPressEnter' | 'value'>;

export const NumericFieldRenderer = (props: FormFieldRendererBaseProps<NumericField> & NumericFieldRendererProps) => {
    const [inputValue, setInputValue] = useState(props.value);

    useEffect(() => {
        setInputValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if (props.changeDelay) {
            let debounceTimeout: number | undefined = window.setTimeout(() => {
                if (inputValue !== props.value) {
                    props.onChange(inputValue);
                }
                debounceTimeout = undefined;
            }, props.changeDelay);

            return () => {
                if (debounceTimeout) {
                    window.clearTimeout(debounceTimeout);
                }
            };
        } else {
            if (inputValue !== props.value) {
                props.onChange(inputValue);
            }
        }
    }, [inputValue]);

    const onInputChange = (value) => {
        setInputValue(value || undefined);
    };

    const onEnterPress = () => {
        if (inputValue !== props.value) {
            props.onChange(inputValue || undefined);
        }
    };

    const { value, onChange, title, required, config, autoFocus, changeDelay, readonly, useSlider, ...renderProps } = props;

    const showSlider = useSlider && config.min !== undefined && config.max !== undefined && !readonly;

    return (
        <div className='numeric-field'>
            {showSlider && <Slider value={props.value} onChange={props.onChange} min={config.min} max={config.max} step={config.step} />}
            <InputNumber
                value={inputValue}
                onPressEnter={onEnterPress}
                onBlur={onEnterPress}
                onChange={onInputChange}
                autoFocus={autoFocus}
                min={config.min}
                max={config.max}
                step={config.step}
                readOnly={readonly}
                {...renderProps}
            ></InputNumber>
        </div>
    );
};

NumericFieldRenderer.defaultProps = {
    changeDelay: 1000
};

antdFormFieldRendererFactory.register<NumericField>(NUMERIC_FIELD_ID, 'input', NumericFieldRenderer);
