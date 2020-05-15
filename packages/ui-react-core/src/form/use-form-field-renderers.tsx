import React, { useMemo } from 'react';
import { FormFieldRendererFactory } from './form-field-renderer-factory';
import { AnyFormFieldDefinition } from '@oida/core';

export type FormFieldRenderersProps = {
    factory: FormFieldRendererFactory,
    fields: AnyFormFieldDefinition[]
};

export const useFormFieldRenderers = ({factory, fields}: FormFieldRenderersProps) => {

    return useMemo(() => fields.map((fieldProps) => {

        let {rendererConfig = {id: undefined, props: {}}, ...field} = fieldProps;

        let fieldRenderer = factory.getRenderer(fieldProps);

        if (fieldRenderer) {
            return {
                FieldRenderer: fieldRenderer.FormFieldRenderer,
                renderProps: {
                    rendererId: fieldRenderer.rendererId,
                    ...field,
                    ...rendererConfig.props
                }
            };
        }
    }), [fields]);
};

