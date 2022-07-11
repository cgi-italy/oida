import React from 'react';
import classnames from 'classnames';
import { Form } from 'antd';

import { IFormFieldDefinition } from '@oidajs/core';
import { useFormFieldRenderers } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type FormFieldWrapperProps = {
    type: string;
    rendererId: string;
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
    required?: boolean;
    readonly?: boolean;
    hidden?: boolean;
};

export const FormFieldWrapper = (props: FormFieldWrapperProps) => {
    const { name, title, description, children, type, required, readonly, hidden, rendererId } = props;
    return (
        <Form.Item
            name={name?.split('.')}
            label={title}
            rules={[{ required: required && !readonly }]}
            tooltip={description}
            hidden={hidden}
            className={classnames(`${type.toLowerCase()}-field`, `${rendererId}-renderer`, { 'is-required': required && !readonly })}
        >
            {children}
        </Form.Item>
    );
};

export type FormFieldsProps = {
    fields: IFormFieldDefinition[];
};

/**
 * A React component that renderes a set of antd form items
 * given a form fields configuration object
 * @param props the component props
 */
export const FormFields = (props: FormFieldsProps) => {
    const fieldsConfig = useFormFieldRenderers({
        fields: props.fields,
        factory: antdFormFieldRendererFactory
    });

    const formFields = fieldsConfig.map((config) => {
        if (config) {
            const { FieldRenderer, renderProps } = config;
            const { rendererId, name, type, readonly, ...fieldProps } = renderProps;

            return (
                <FormFieldWrapper key={renderProps.name} readonly={readonly} {...renderProps}>
                    <FieldRenderer
                        {...fieldProps}
                        readonly={readonly}
                        value={undefined}
                        onChange={() => {
                            // do nothing. it will be handled by the
                            // antd form instance
                        }}
                    />
                </FormFieldWrapper>
            );
        }
    });

    return <React.Fragment>{formFields}</React.Fragment>;
};
