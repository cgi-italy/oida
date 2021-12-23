import { createDynamicFactory } from '../utils';

import { IFormFieldType, IFormFieldValueType, IFormField } from './form-field';

export type FormFieldFromJSON<TYPE extends IFormFieldType> = (value: any) => IFormFieldValueType<TYPE>;
export type FormFieldToJSON<TYPE extends IFormFieldType> = (value: IFormFieldValueType<TYPE>) => any;

export type FormFieldToString<TYPE extends IFormFieldType> = (formField: IFormField<TYPE>, options?: Record<string, any>) => string;

export type FormFieldSerializer<TYPE extends IFormFieldType> = {
    fromJSON: FormFieldFromJSON<TYPE>;
    toJSON: FormFieldToJSON<TYPE>;
    toString: FormFieldToString<TYPE>;
};

const defaultFormFieldFromJSON = (value) => {
    return value;
};

const defaultFormFieldToJSON = (value) => {
    return value;
};

const defaultFormFieldToString = (formField) => {
    return `${formField.title}: ${formField.value}`;
};

const defaultFormFieldSerializer = {
    fromJSON: defaultFormFieldFromJSON,
    toJSON: defaultFormFieldToJSON,
    toString: defaultFormFieldToString
};

const formFieldSerializers = createDynamicFactory<FormFieldSerializer<any>>('formFieldsIO');

export type FormFieldSerializerSetter<TYPE extends IFormFieldType> = (type: TYPE, serializer: Partial<FormFieldSerializer<TYPE>>) => void;

export function setFormFieldSerializer<TYPE extends IFormFieldType>(type: TYPE, serializer: Partial<FormFieldSerializer<TYPE>>) {
    formFieldSerializers.register(type, () => {
        return {
            ...defaultFormFieldSerializer,
            ...serializer
        };
    });
}

export function getFormFieldSerializer<TYPE extends IFormFieldType>(type: TYPE): FormFieldSerializer<TYPE> {
    if (formFieldSerializers.isRegistered(type)) {
        return formFieldSerializers.create(type, undefined) as FormFieldSerializer<TYPE>;
    } else {
        return defaultFormFieldSerializer;
    }
}
