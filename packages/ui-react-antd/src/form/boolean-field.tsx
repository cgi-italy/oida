import React from 'react';
import { Checkbox, Switch } from 'antd';
import { SwitchProps } from 'antd/lib/switch';
import { CheckboxProps } from 'antd/lib/checkbox';

import { BooleanField, BOOLEAN_FIELD_ID } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';


export const BooleanCheckboxFieldRenderer = (
    props: FormFieldRendererBaseProps<BooleanField> & Omit<CheckboxProps, 'onChange' | 'value'>
) => {

    const {value, onChange, title, required, config, autoFocus, ...renderProps} = props;

    const onCheckboxChange = (evt) => onChange(evt.target.checked);
    return (
        <Checkbox
            checked={value}
            onChange={onCheckboxChange}
            {...renderProps}
        >
            {props.title}
        </Checkbox>
    );
};

export const BooleanSwitchFieldRenderer = (props:
    FormFieldRendererBaseProps<BooleanField> & Omit<SwitchProps, 'onChange'>
) => {

    const {value, onChange, title, required, config, autoFocus, ...renderProps} = props;

    return (
        <Switch
            checked={value}
            onChange={onChange}
            {...renderProps}
        />
    );
};

antdFormFieldRendererFactory.register<BooleanField>(
    BOOLEAN_FIELD_ID, 'checkbox',
    BooleanCheckboxFieldRenderer
);

antdFormFieldRendererFactory.register<BooleanField>(
    BOOLEAN_FIELD_ID, 'switch',
    BooleanSwitchFieldRenderer
);
