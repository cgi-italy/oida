import React from 'react';
import classnames from 'classnames';

import { Form } from 'antd';
import { FormProps } from 'antd/lib/form';

import { FormRendererProps, useFormFieldRenderers } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';


export const FieldWrapper = (props) => {

    let { name, title, children, type, required, rendererId } = props;
    return (
        <Form.Item
            label={title}
            rules={[{required: required}]}
            className={classnames(`${type.toLowerCase()}-field`, `${rendererId}-renderer`, {'is-required': required})}
        >
            {children}
        </Form.Item>
    );
};

export type DataFormProps = FormRendererProps & Omit<FormProps, 'form' | 'initialValues' | 'fields' | 'onFieldsChange' | 'onValuesChange' | 'validateTrigger'>;

export const DataForm = (props: DataFormProps) => {

    const { onFieldChange, values, fields, className, ...formRenderProps } = props;

    const fieldsConfig = useFormFieldRenderers({
        fields: fields,
        factory: antdFormFieldRendererFactory
    });

    const formFields = fieldsConfig.map((config) => {
        if (config) {
            const { FieldRenderer, renderProps } = config;
            const { rendererId, name, type, ...fieldProps } = renderProps;
            return (
                <FieldWrapper key={renderProps.name} {...renderProps}>
                    <FieldRenderer
                        {...fieldProps}
                        value={values.get(renderProps.name)}
                        onChange={(value) => onFieldChange(renderProps.name, value)}
                    />
                </FieldWrapper>
            );
        }
    });

    return (
        <Form
            className={classnames('antd-form-renderer', className)}
            layout='vertical'
            size='small'
            {...formRenderProps}
        >
            {formFields}
        </Form>
    );
};
