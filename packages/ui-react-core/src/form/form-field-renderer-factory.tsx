
import { FormField, FormFieldConfig, FormFieldRenderer, FormFieldDefinition, isFormFieldDefinitionWithWrapper } from './form-field';

type ExtractType<IT extends FormField<any, any, any>> = IT extends FormField<infer TYPE, any, any> ? TYPE : never;
type ExtractValue<IT extends FormField<any, any, any>> = IT extends FormField<any, infer T, any> ? T : never;
type ExtractConfig<IT extends FormField<any, any, any>> = IT extends FormField<any, any, infer CONFIG> ? CONFIG : never;

export const formFieldRendererFactory = () => {
    const REGISTERED_RENDERERS = new Map<string, Map<string, FormFieldRenderer<any>>>();

    const register = <T extends FormField<any, any, any>>(fieldId: ExtractType<T>, rendererId: string, renderer: FormFieldRenderer<T>) => {
        if (!REGISTERED_RENDERERS.has(fieldId)) {
            REGISTERED_RENDERERS.set(fieldId, new Map());
        }

        let renderers = REGISTERED_RENDERERS.get(fieldId);
        renderers.set(rendererId, renderer);

    };

    const getRenderer = <T extends FormField<any, any, any>>
    (config: FormFieldDefinition<ExtractType<T>, ExtractValue<T>, ExtractConfig<T>>) => {
        let renderers = REGISTERED_RENDERERS.get(config.type);
        if (!renderers) {
            return null;
        }

        let renderer;
        if (config.rendererConfig && config.rendererConfig.id) {
            renderer = renderers.get(config.rendererConfig.id);
        } else {
            renderer = renderers.values().next().value;
        }

        if (!renderer) {
            return null;
        }

        if (isFormFieldDefinitionWithWrapper(config)) {
            const finalRenderer = renderer;
            renderer = (props) => config.wrapper({
                render: finalRenderer,
                ...props
            });
        }
        return renderer as FormFieldRenderer<T>;
    };

    return {
        register,
        getRenderer
    };
};
