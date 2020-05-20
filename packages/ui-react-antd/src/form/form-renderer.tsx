import React from 'react';
import classnames from 'classnames';

import { Form } from 'antd';

import { AnyFormFieldDefinition, FormFieldValues } from '@oida/core';
import { useFormFieldRenderers } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';

export const FieldWrapper = (props) => {

    let { title, children, type, rendererId } = props;
    return (
        <Form.Item label={title} className={classnames(`${type.toLowerCase()}-field`, `${rendererId}-renderer`)}>
            {children}
        </Form.Item>
    );
};

export type FormRendererProps = {
    fields: AnyFormFieldDefinition[],
    values: FormFieldValues,
    onFieldChange?: (name: string, value: any) => void;
    className?: string;
};

export const FormRenderer = (props: FormRendererProps) => {

    const fieldsConfig = useFormFieldRenderers({
        fields: props.fields,
        factory: antdFormFieldRendererFactory
    });

    const onFieldChange = (name, value) => {
        if (props.onFieldChange) {
            props.onFieldChange(name, value);
        }
    };

    const fields = fieldsConfig.map((config) => {
        if (config) {
            let { FieldRenderer, renderProps } = config;
            return (
                <FieldWrapper key={renderProps.name} {...renderProps}>
                    <FieldRenderer
                        {...renderProps}
                        value={props.values.get(renderProps.name)}
                        onChange={(value) => onFieldChange(renderProps.name, value)}
                    />
                </FieldWrapper>
            );
        }
    });

    return (
        <Form
            className={classnames('antd-form-renderer', props.className)}
            layout='vertical'
            size='small'
        >
            {fields}
        </Form>
    );

};
