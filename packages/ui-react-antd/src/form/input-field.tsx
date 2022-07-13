import React, { useState, useEffect } from 'react';

import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';

import { StringField, STRING_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type InputFieldRendererProps = {
    changeDelay?: number;
} & Omit<InputProps, 'onChange' | 'onPressEnter' | 'value'>;

export const InputFieldRenderer = (props: FormFieldRendererBaseProps<StringField> & InputFieldRendererProps) => {
    const [inputValue, setInputValue] = useState(props.value);

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
        setInputValue(evt.target.value || undefined);
    };

    const onEnterPress = () => {
        props.onChange(inputValue || undefined);
    };

    const { value, onChange, title, required, config, autoFocus, changeDelay, readonly, ...renderProps } = props;

    return (
        <Input
            value={inputValue}
            onPressEnter={onEnterPress}
            onChange={onInputChange}
            onBlur={onEnterPress}
            autoFocus={autoFocus}
            readOnly={readonly}
            {...renderProps}
        ></Input>
    );
};

InputFieldRenderer.defaultProps = {
    changeDelay: 1000
};

antdFormFieldRendererFactory.register<StringField>(STRING_FIELD_ID, 'input', InputFieldRenderer);
