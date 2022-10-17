import React, { useState } from 'react';
import classnames from 'classnames';

import { Checkbox, Form } from 'antd';
import { FormProps } from 'antd/lib/form';

import { FormRendererProps, useFormFieldRenderers } from '@oidajs/ui-react-core';

import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';
import { FormFieldWrapper } from './form-fields';

export type FieldLabelWithCheckboxProps<T = any> = {
    title?: string;
    value: T;
    onCheckedChange: (checked: boolean, lastValue?: T) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const FieldLabelWithCheckbox = <T extends unknown = any>(props: FieldLabelWithCheckboxProps<T>) => {
    const [lastValue, setLastValue] = useState(props.value);

    return (
        <Checkbox
            checked={props.value !== undefined}
            onChange={(evt) => {
                if (evt.target.checked) {
                    props.onCheckedChange(true, lastValue);
                } else {
                    setLastValue(props.value);
                    props.onCheckedChange(false);
                }
            }}
        >
            {props.title}
        </Checkbox>
    );
};

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
            const readonly = formReadonly || fieldReadonly || false;
            const value = values.get(renderProps.name);
            const hidden = renderProps.hidden || (readonly && (value === undefined || value === '')) || false;
            const { name: _name, title, readonly: _readonly, hidden: _hidden, ...otherRenderProps } = renderProps;

            let label: React.ReactNode = title;
            let shouldRenderField = true;
            if (!renderProps.required) {
                const useCheckboxConfig = antdFormFieldRendererFactory.getUseCheckboxWhenOptional(type, rendererId);
                if (useCheckboxConfig.useCheckbox) {
                    // the renderer doesn't support undefined value. we wrap it with a checkbox
                    // and we renderer it only when the checkbox is checked (value is not undefined)
                    let fieldConfig;
                    if (typeof renderProps.config === 'function') {
                        fieldConfig = renderProps.config({
                            value,
                            onChange: (value) => {
                                onFieldChange(renderProps.name, value);
                            }
                        });
                    } else {
                        fieldConfig = renderProps.config;
                    }

                    label = (
                        <FieldLabelWithCheckbox
                            title={title}
                            value={value}
                            onCheckedChange={(checked, lastValue) => {
                                if (checked) {
                                    onFieldChange(renderProps.name, lastValue || useCheckboxConfig.defaultValueGetter(fieldConfig));
                                } else {
                                    onFieldChange(renderProps.name, undefined);
                                }
                            }}
                        />
                    );

                    shouldRenderField = value !== undefined;
                }
            }
            return (
                <FormFieldWrapper key={renderProps.name} readonly={readonly} hidden={hidden} title={label} {...otherRenderProps}>
                    {shouldRenderField && (
                        <FieldRenderer
                            {...fieldProps}
                            readonly={readonly}
                            value={value}
                            onChange={(value) => onFieldChange(renderProps.name, value)}
                        />
                    )}
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
