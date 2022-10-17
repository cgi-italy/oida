import { ExtractFormFieldConfig, ExtractFormFieldType, ExtractFormFieldValue, FormField } from '@oidajs/core';
import { formFieldRendererFactory, setDefaultFormFieldRendererFactory } from '@oidajs/ui-react-core';

const useCheckboxForField: Record<string, Record<string, any>> = {};

export type CheckboxOutputType<T extends FormField<any, any, any>> =
    | {
          useCheckbox: true;
          defaultValueGetter: (config: ExtractFormFieldConfig<T>) => ExtractFormFieldValue<T>;
      }
    | {
          useCheckbox: false;
      };

export const antdFormFieldRendererFactory = {
    ...formFieldRendererFactory(),
    getUseCheckboxWhenOptional: <T extends FormField<any, any, any>>(
        fieldType: ExtractFormFieldType<T>,
        rendererId: string
    ): CheckboxOutputType<T> => {
        if (useCheckboxForField[fieldType] && useCheckboxForField[fieldType][rendererId]) {
            return {
                useCheckbox: true,
                defaultValueGetter: useCheckboxForField[fieldType][rendererId]
            };
        } else {
            return {
                useCheckbox: false
            };
        }
    },
    /**
     * Use this method to wrap a non required field with a checkbox to enable/disable it.
     * Useful for renderers that don't support undefined values (e.g. a slider)
     * @param fieldType The field type
     * @param rendererId The field renderer id
     * @param initialValue This function will be called the first time the checkbox is enabled to initialize
     * the value of the form field
     */
    setUseCheckboxWhenOptional: <T extends FormField<any, any, any>>(
        fieldType: ExtractFormFieldType<T>,
        rendererId: string,
        initialValue: (config: ExtractFormFieldConfig<T>) => ExtractFormFieldValue<T>
    ) => {
        let checkboxForFieldType = useCheckboxForField[fieldType];
        if (!checkboxForFieldType) {
            checkboxForFieldType = {};
            useCheckboxForField[fieldType] = checkboxForFieldType;
        }
        checkboxForFieldType[rendererId] = initialValue;
    }
};

setDefaultFormFieldRendererFactory(antdFormFieldRendererFactory);
