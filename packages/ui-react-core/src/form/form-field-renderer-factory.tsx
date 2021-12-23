import React from 'react';

import { FormField, FormFieldConfig, FormFieldDefinition } from '@oidajs/core';

type ExtractType<IT extends FormField<any, any, any>> = IT extends FormField<infer TYPE, any, any> ? TYPE : never;
type ExtractValue<IT extends FormField<any, any, any>> = IT extends FormField<any, infer T, any> ? T : never;
type ExtractConfig<IT extends FormField<any, any, any>> = IT extends FormField<any, any, infer CONFIG> ? CONFIG : never;

export type FormFieldRendererBaseProps<F extends FormField<any, any, any>> = Omit<F, 'type' | 'name' | 'rendererConfig'>;
export type FormFieldRenderer<T extends FormField<any, any, any>> = (
    props: FormFieldRendererBaseProps<T> & Record<string, any>
) => JSX.Element | null;

export type FormFieldRendererWrapper<T extends FormField<any, any, any>> = (
    props: Omit<FormFieldRendererBaseProps<T>, 'config'> & { config: FormFieldConfig<ExtractConfig<T>, ExtractValue<T>> } & Record<
            string,
            any
        >
) => JSX.Element | null;

/** Create a new form field renderer factory */
export const formFieldRendererFactory = () => {
    const REGISTERED_RENDERERS = new Map<string, Map<string, FormFieldRenderer<any>>>();

    /**
     * Register a new renderer for a form field type. More than one renderer can be registered for
     * form field type.
     *
     * @param fieldId The field type
     * @param rendererId A unique identifier for the renderer
     * @param renderer The form field renderer component
     *
     */
    const register = <T extends FormField<any, any, any>>(fieldId: ExtractType<T>, rendererId: string, renderer: FormFieldRenderer<T>) => {
        if (!REGISTERED_RENDERERS.has(fieldId)) {
            REGISTERED_RENDERERS.set(fieldId, new Map());
        }

        const renderers = REGISTERED_RENDERERS.get(fieldId);
        renderers!.set(rendererId, renderer);
    };

    /**
     * Get the renderer from a form field definition. If multiple renderers are available the {@Link FormFieldCommon definition}
     * renderConfig id can be used to select a specific one.
     * @param definition The form field definition
     * @returns the renderer id and the registered renderer React component
     **/
    const getRenderer = <T extends FormField<any, any, any>>(
        definition: FormFieldDefinition<ExtractType<T>, ExtractValue<T>, ExtractConfig<T>>
    ) => {
        const renderers = REGISTERED_RENDERERS.get(definition.type);
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

        let FormFieldRenderer = renderers.get(rendererId)!;

        if (typeof definition.config === 'function') {
            //wrap the field renderer to extract the config from the state and pass it to over
            const Renderer = FormFieldRenderer;
            FormFieldRenderer = (props) => {
                const { config, ...renderProps } = props;

                const fieldConfig = config({
                    onChange: props.onChange,
                    value: props.value
                });

                if (fieldConfig) {
                    return <Renderer {...renderProps} config={fieldConfig} />;
                } else {
                    return null;
                }
            };
        }

        return {
            rendererId: rendererId,
            FormFieldRenderer: FormFieldRenderer as FormFieldRendererWrapper<T>
        };
    };

    return {
        register,
        getRenderer
    };
};

/** A form field renderer factory. It provides React components to renderer a form field from a configuration object */
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
