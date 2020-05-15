import React from 'react';

import { Checkbox, Switch } from 'antd';

import { BooleanField, BOOLEAN_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export const BooleanCheckboxFieldRenderer = (props: Omit<BooleanField, 'name' | 'type'>) => {

    const onChange = (evt) => props.onChange(evt.target.checked);
    return (
        <Checkbox
            checked={props.value}
            onChange={onChange}
        >{props.title}
        </Checkbox>
    );
};

export const BooleanSwitchFieldRenderer = (props: Omit<BooleanField, 'name' | 'type'>) => {

    const onChange = (checked) => props.onChange(checked);
    return (
        <Switch
            checked={props.value}
            onChange={onChange}
            size='small'
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
