import React, { useState, useEffect, useRef } from 'react';

import { Input } from 'antd';

import { StringField, STRING_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type InputFieldRendererProps = {
    prefix?: React.ReactNode,
    suffix?: React.ReactNode,
    addonBefore?: React.ReactNode,
    addonAfter?: React.ReactNode,
    changeDelay?: number
};

export const InputFieldRenderer = (props: Omit<StringField, 'name' | 'type'> & InputFieldRendererProps) => {

    let [inputValue, setInputValue] = useState(props.value);

    useEffect(() => {
        setInputValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if (props.changeDelay) {
            let debounceTimeout: number | undefined = window.setTimeout(() => {
                props.onChange(inputValue);
                debounceTimeout = undefined;
            }, props.changeDelay);

            return () => {
                if (debounceTimeout) {
                    window.clearTimeout(debounceTimeout);
                }
            };
        } else {
            props.onChange(inputValue);
        }
    }, [inputValue]);

    const onInputChange = (evt) => {
        setInputValue(evt.target.value);
    };

    const onEnterPress = () => {
        props.onChange(inputValue);
    };


    let { value, onChange, changeDelay, ...renderProps } =  props;

        return (
        <Input
            value={inputValue}
            onPressEnter={onEnterPress}
            onChange={onInputChange}
            {...renderProps}
        >
        </Input>
    );
};


InputFieldRenderer.defaultProps = {
    changeDelay: 1000
};

antdFormFieldRendererFactory.register<StringField>(
    STRING_FIELD_ID, 'input',
    InputFieldRenderer
);
