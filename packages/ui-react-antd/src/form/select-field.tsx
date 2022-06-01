import React, { useState, useEffect } from 'react';

import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';

import { EnumField, ENUM_FIELD_ID, EnumChoice } from '@oidajs/core';
import { FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

const Option = Select.Option;

export const SelectEnumRenderer = (
    props: FormFieldRendererBaseProps<EnumField> & Omit<SelectProps<string | string[]>, 'onChange' | 'value'>
) => {
    const { value, onChange, title, required, config, autoFocus, readonly, ...renderProps } = props;

    const [options, setOptions] = useState<JSX.Element[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const onSelectChange = (value) => {
        if (value === undefined || (Array.isArray(value) && !value.length)) {
            onChange(undefined);
        } else {
            onChange(value);
        }
    };

    const getOptions = (choices: EnumChoice[]) => {
        return choices.map((choice) => {
            return (
                <Option key={choice.value} value={choice.value}>
                    {choice.name}
                </Option>
            );
        });
    };

    useEffect(() => {
        if (Array.isArray(config.choices)) {
            setOptions(getOptions(config.choices));
        } else {
            let isComponentMounted = true;
            setIsLoading(true);
            config.choices().then((choices) => {
                if (isComponentMounted) {
                    setOptions(getOptions(choices));
                    setIsLoading(false);
                }
            });

            return () => {
                isComponentMounted = false;
            };
        }
    }, [config.choices]);

    return (
        <Select
            style={{ minWidth: '150px', width: '100%' }}
            value={value}
            onChange={onSelectChange}
            allowClear={!required}
            mode={config.multiple ? 'multiple' : undefined}
            loading={isLoading}
            autoFocus={autoFocus}
            open={readonly ? false : undefined}
            {...renderProps}
        >
            {options}
        </Select>
    );
};

antdFormFieldRendererFactory.register<EnumField>(ENUM_FIELD_ID, 'select', SelectEnumRenderer);
