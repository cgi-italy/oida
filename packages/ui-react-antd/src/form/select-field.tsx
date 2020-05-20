import React from 'react';

import { Select } from 'antd';

import { EnumField, ENUM_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

const Option = Select.Option;

export type SelectFieldRendererProps = {
    placeholder?: string;
};

export const SelectEnumRenderer = (props: Omit<EnumField, 'name' | 'type'> & SelectFieldRendererProps) => {

    const onSelectChange = (value) => {
        if (!value || (Array.isArray(value) && !value.length)) {
            props.onChange(undefined);
        } else {
            props.onChange(value);
        }
    };

    let options = props.config.choices.map((choice) => {
        return <Option key={choice.value} value={choice.value}>{choice.name}</Option>;
    });

    return (
        <Select
            style={{minWidth: '150px', width: '100%'}}
            value={props.value}
            onChange={onSelectChange}
            allowClear={!props.required}
            placeholder={props.placeholder}
            mode={props.config.multiple ? 'multiple' : undefined}
        >
            {options}
        </Select>
    );
};

antdFormFieldRendererFactory.register<EnumField>(
    ENUM_FIELD_ID, 'select',
    SelectEnumRenderer
);
