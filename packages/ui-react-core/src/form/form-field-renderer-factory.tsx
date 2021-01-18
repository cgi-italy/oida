
import React from 'react';

import { FormField, FormFieldDefinition, isFormFieldConfigFromState, FormFieldState } from '@oida/core';

type ExtractType<IT extends FormField<any, any, any>> = IT extends FormField<infer TYPE, any, any> ? TYPE : never;
type ExtractValue<IT extends FormField<any, any, any>> = IT extends FormField<any, infer T, any> ? T : never;
type ExtractConfig<IT extends FormField<any, any, any>> = IT extends FormField<any, any, infer CONFIG> ? CONFIG : never;


export type FormFieldRenderer<T extends FormField<any, any, any>> = (props: T) => JSX.Element | null;
export type FormFieldExtendedRenderer<T extends FormField<any, any, any>> = (
    props: Omit<
        FormFieldDefinition<ExtractType<T>, ExtractValue<T>, ExtractConfig<T>> & FormFieldState<ExtractValue<T>>, 'rendererConfig'
    > & Record<string, any>
) => JSX.Element | null;

export const formFieldRendererFactory = () => {
    const REGISTERED_RENDERERS = new Map<string, Map<string, FormFieldRenderer<any>>>();

    const register = <T extends FormField<any, any, any>>(fieldId: ExtractType<T>, rendererId: string, renderer: FormFieldRenderer<T>) => {
        if (!REGISTERED_RENDERERS.has(fieldId)) {
            REGISTERED_RENDERERS.set(fieldId, new Map());
        }

        let renderers = REGISTERED_RENDERERS.get(fieldId);
        renderers!.set(rendererId, renderer);

    };

    const getRenderer = <T extends FormField<any, any, any>>
    (definition: FormFieldDefinition<ExtractType<T>, ExtractValue<T>, ExtractConfig<T>>) => {
        let renderers = REGISTERED_RENDERERS.get(definition.type);
        if (!renderers) {
            return null;
        }

        let rendererId: string;
        if (definition.rendererConfig && definition.rendererConfig.id && renderers.has(definition.rendererConfig.id)) {
            rendererId = definition.rendererConfig.id;
        } else {
            rendererId = renderers.keys().next().value;
        }
        if (!rendererId) {
            return null;
        }

        let FormFieldRenderer =  renderers.get(rendererId)!;

        if (isFormFieldConfigFromState(definition)) {
            let Renderer = FormFieldRenderer;
            FormFieldRenderer = (props) => {

                let { config, ...renderProps} = props;

                let fieldConfig = config({
                    onChange: props.onChange,
                    value: props.value
                });

                if (fieldConfig) {
                    return (
                        <Renderer {...renderProps} config={fieldConfig}/>
                    );
                } else {
                    return null;
                }
            };
        }

        return {
            rendererId: rendererId,
            FormFieldRenderer: FormFieldRenderer as FormFieldExtendedRenderer<T>
        };
    };

    return {
        register,
        getRenderer
    };
};

export type FormFieldRendererFactory = ReturnType<typeof formFieldRendererFactory>;

let defaultFormFieldRendererFactory: FormFieldRendererFactory;

export const getDefaultFormFieldRendererFactory = () => {
    if (!defaultFormFieldRendererFactory) {
        throw new Error('getDefaultFormFieldRendererFactory: no default factory registered');
    }
    return defaultFormFieldRendererFactory;
};

export const setDefaultFormFieldRendererFactory = (rendererFactory: FormFieldRendererFactory) => {
    defaultFormFieldRendererFactory = rendererFactory;
};
