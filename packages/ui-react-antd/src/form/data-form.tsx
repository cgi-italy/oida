import React from 'react';
import classnames from 'classnames';

import { Form } from 'antd';
import { FormProps } from 'antd/lib/form';

import { FormRendererProps, useFormFieldRenderers } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';
import { FormFieldWrapper } from './form-fields';

export type DataFormProps = FormRendererProps &
    Omit<FormProps, 'form' | 'initialValues' | 'fields' | 'onFieldsChange' | 'onValuesChange' | 'validateTrigger'>;

export const DataFormItems = (props: Pick<DataFormProps, 'onFieldChange' | 'values' | 'fields' | 'readonly'>) => {
    const { onFieldChange, values, fields, readonly: formReadonly } = props;

    const fieldsConfig = useFormFieldRenderers({
        fields: fields,
        factory: antdFormFieldRendererFactory
    });

    const formFields = fieldsConfig.map((config) => {
        if (config) {
            const { FieldRenderer, renderProps } = config;
            const { rendererId, name, type, readonly: fieldReadonly, ...fieldProps } = renderProps;
            const readonly = formReadonly || fieldReadonly;
            const value = values.get(renderProps.name);
            const hidden = readonly && (value === undefined || value === '');
            const { name: _unusedName, ...otherRenderProps } = renderProps;
            return (
                <FormFieldWrapper key={renderProps.name} readonly={readonly} hidden={hidden} {...otherRenderProps}>
                    <FieldRenderer
                        {...fieldProps}
                        readonly={readonly}
                        value={value}
                        onChange={(value) => onFieldChange(renderProps.name, value)}
                    />
                </FormFieldWrapper>
            );
        }
    });

    return <React.Fragment>{formFields}</React.Fragment>;
};

export const DataForm = (props: DataFormProps) => {
    const { onFieldChange, values, fields, className, readonly, ...formRenderProps } = props;

    return (
        <Form className={classnames('antd-form-renderer', className)} layout='vertical' size='small' {...formRenderProps}>
            <DataFormItems fields={fields} values={values} onFieldChange={onFieldChange} readonly={readonly} />
        </Form>
    );
};
