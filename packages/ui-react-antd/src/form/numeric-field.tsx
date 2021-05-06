import React, { useState, useEffect, useRef } from 'react';

import { InputNumber } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';

import { NumericField, NUMERIC_FIELD_ID } from '@oida/core';
import { FormFieldRendererBaseProps } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';


export type NumericFieldRendererProps = {
    changeDelay?: number;
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

    let { value, onChange, title, required, config, autoFocus, changeDelay, ...renderProps } =  props;

    return (
        <InputNumber
            value={inputValue}
            onPressEnter={onEnterPress}
            onChange={onInputChange}
            autoFocus={props.autoFocus}
            min={config.min}
            max={config.max}
            step={config.step}
            {...renderProps}
        >
        </InputNumber>
    );
};


NumericFieldRenderer.defaultProps = {
    changeDelay: 1000
};

antdFormFieldRendererFactory.register<NumericField>(
    NUMERIC_FIELD_ID, 'input',
    NumericFieldRenderer
);
