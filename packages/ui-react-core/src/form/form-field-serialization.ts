
import { createDynamicFactory } from '@oida/core';

import { FormField } from './form-field';

type ExtractType<IT extends FormField<any, any, any>> = IT extends FormField<infer TYPE, any, any> ? TYPE : never;
type ExtractValue<IT extends FormField<any, any, any>> = IT extends FormField<any, infer T, any> ? T : never;
type ExtractConfig<IT extends FormField<any, any, any>> = IT extends FormField<any, any, infer CONFIG> ? CONFIG : never;

export type FormFieldFromKVP<T> = (queryParams: {[x: string]: any}, name: string) => T;
export type FormFieldToKVP<T> = (formField: {name: string, value: T}) => {[x: string]: any};
export type FormFieldToString<CONFIG, T> = (formField: {title: string, config: CONFIG, value: T}) => string;

export type FormFieldSerializer<CONFIG, T> = {
    fromKVP: FormFieldFromKVP<T>;
    toKVP: FormFieldToKVP<T>;
    toString: FormFieldToString<CONFIG, T>;
};

const defaultFormFieldFromKVP = (queryParams, name) => {
    return queryParams[name];
};

const defaultFormFieldToKVP = (formField) => {
    return {
        [formField.name]: formField.value
    };
};

const defaultFormFieldToString = (formField) => {
    return `${formField.title}: ${formField.value}`;
};

let defaultFormFieldSerializer = {
    fromKVP: defaultFormFieldFromKVP,
    toKVP: defaultFormFieldToKVP,
    toString: defaultFormFieldToString
};


const formFieldSerializers = createDynamicFactory<FormFieldSerializer<any, any>>('formFieldsIO');

export const setFormFieldSerializer = <T extends FormField<any, any, any>>
(type: ExtractType<T>, serializer: Partial<FormFieldSerializer<ExtractConfig<T>, ExtractValue<T>>>) => {
    formFieldSerializers.register(type, (config) => {
        return {
            ...defaultFormFieldSerializer,
            ...serializer
        };
    });
};

export const getFormFieldSerializer = (type: string) => {
    if (formFieldSerializers.isRegistered(type)) {
        return formFieldSerializers.create(type);
    } else {
        return defaultFormFieldSerializer;
    }
};

