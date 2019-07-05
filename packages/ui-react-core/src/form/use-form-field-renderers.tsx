import React, { useMemo } from 'react';
import { FormFieldRendererFactory } from './form-field-renderer-factory';
import { AnyFormFieldDefinition } from './form-field';

export type FormFieldRenderersProps = {
    factory: FormFieldRendererFactory,
    filters: AnyFormFieldDefinition[]
};

export const useFormFieldRenderers = ({factory, filters}: FormFieldRenderersProps) => {

    return useMemo(() => filters.map((filterProps) => {

        let {rendererConfig = {id: undefined, props: {}}, ...filter} = filterProps;

        let FilterRenderer = factory.getRenderer(filterProps);

        if (FilterRenderer) {
            return {
                FilterRenderer: FilterRenderer,
                renderProps: {
                    ...filter,
                    ...rendererConfig.props
                }
            };
        }
    }), [filters]);
};

