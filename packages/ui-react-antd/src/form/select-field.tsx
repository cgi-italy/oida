import React, { useState, useEffect } from 'react';

import { Select } from 'antd';

import { EnumField, ENUM_FIELD_ID, EnumChoice } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

const Option = Select.Option;

export type SelectFieldRendererProps = {
    placeholder?: string;
};

export const SelectEnumRenderer = (props: Omit<EnumField, 'name' | 'type'> & SelectFieldRendererProps) => {

    const [options, setOptions] = useState<JSX.Element[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const onSelectChange = (value) => {
        if (value === undefined || (Array.isArray(value) && !value.length)) {
            props.onChange(undefined);
        } else {
            props.onChange(value);
        }
    };

    const getOptions = (choices: EnumChoice[]) => {
        return choices.map((choice) => {
            return <Option key={choice.value} value={choice.value}>{choice.name}</Option>;
        });
    };

    useEffect(() => {
        if (Array.isArray(props.config.choices)) {
            setOptions(getOptions(props.config.choices));
        } else {
            let isComponentMounted = true;
            setIsLoading(true);
            let choicesRequest = props.config.choices().then((choices) => {
                if (isComponentMounted) {
                    setOptions(getOptions(choices));
                    setIsLoading(false);
                }
            });

            return () => {
                isComponentMounted = false;
            };
        }
    }, []);


    return (
        <Select
            style={{minWidth: '150px', width: '100%'}}
            value={props.value}
            onChange={onSelectChange}
            allowClear={!props.required}
            placeholder={props.placeholder}
            mode={props.config.multiple ? 'multiple' : undefined}
            loading={isLoading}
        >
            {options}
        </Select>
    );
};

antdFormFieldRendererFactory.register<EnumField>(
    ENUM_FIELD_ID, 'select',
    SelectEnumRenderer
);
