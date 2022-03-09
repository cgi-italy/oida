import { useMemo } from 'react';
import { FormFieldRendererFactory } from './form-field-renderer-factory';
import { IFormFieldDefinition } from '@oidajs/core';

export type FormFieldRenderersProps = {
    factory: FormFieldRendererFactory;
    fields: IFormFieldDefinition[];
};

/**
 * A React hook that given an array of form field definitions and a form field rendering factory
 * returns a list of React field renderer components together with their configuration props
 */
export const useFormFieldRenderers = ({ factory, fields }: FormFieldRenderersProps) => {
    return useMemo(
        () =>
            fields.map((fieldProps) => {
                const { rendererConfig = { id: undefined, props: {} }, ...field } = fieldProps;

                const fieldRenderer = factory.getRenderer(fieldProps);

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
            }),
        [fields]
    );
};
