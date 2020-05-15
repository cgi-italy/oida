import React from 'react';
import classnames from 'classnames';

import { AnyFormFieldDefinition, FormFieldValues } from '@oida/core';
import { useFormFieldRenderers } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';

export const FieldWrapper = (props) => {

    let { title, children, type, rendererId } = props;
    return (
        <div className={classnames('ant-form-item', `${type.toLowerCase()}-field`, `${rendererId}-renderer`)}>
            {title && <div className='ant-form-item-label'>
                <label>{title}</label>
            </div>}
            <div className='ant-form-item-control-wrapper'>
                <div className='ant-form-item-control'>
                    {children}
                </div>
            </div>
        </div>
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
        <div className={classnames('antd-form-renderer ant-form', props.className)}>
            {fields}
        </div>
    );

};
