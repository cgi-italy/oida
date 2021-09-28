import { IFormFieldDefinition } from '@oida/core';
import { DataFilters } from '@oida/state-mobx';
import { FormRendererProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

export type FormDataProps = {
    /** The form fields values */
    fieldValues?: DataFilters;
    /** The form fields definitions */
    fields: IFormFieldDefinition[];
    /**
     * A flag indicating if the hooks should be re-executed when the fields array change.
     * Set it to true for dynamic forms. Be sure to memoize the input fields array when setting this
     * flga to true.
     */
    trackFieldsDefinitions?: boolean;
};

/**
 * React hook that given an array of form field definition and a filter state object, extract the form field values from the state
 * in a format that can be passed to a component implementing the {@link FormRenderer} interface. Every time the field values object is
 * updated the hook is re-executed
 * @returns properties object that can be passed to the FormRenderer {{@link FormRenderer}} implementation
*/
export const useFormData = (props: FormDataProps) => {

    const { fieldValues, fields } = props;

    const hooksDeps: React.DependencyList = props.trackFieldsDefinitions ? [fieldValues, fields] : [fieldValues];

    return useSelector(() => {
        if (!fieldValues) {
            return;
        }

        let values = new Map<string, any>();
        fieldValues.asArray().forEach((item) => {
            values.set(item.key, item.value);
        });

        return {
            fields: fields,
            values: values,
            onFieldChange: (name, value) => {
                if (value !== undefined) {
                    let filterConfig = props.fields.find((f) => {
                        return f.name === name;
                    });
                    if (filterConfig) {
                        fieldValues.set(name, value, filterConfig.type);
                    }
                } else {
                    fieldValues.unset(name);
                }
            }
        } as FormRendererProps;
    }, hooksDeps);
};
