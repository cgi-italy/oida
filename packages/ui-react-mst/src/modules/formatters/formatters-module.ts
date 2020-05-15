import React from 'react';
import { types, Instance } from 'mobx-state-tree';

import { FormatterQuantity, Formatter } from '@oida/core';
import { hasConfig } from '@oida/state-mst';

import { AppModule, AppModuleStateModel } from '../app-module';

type FormatterQuantityConfig<TYPE, OPTIONS> = {
    quantity: FormatterQuantity<TYPE, OPTIONS>;
    formatter: Formatter<TYPE, OPTIONS>;
    formatterOptions: Array<{id: string, name: string, options: OPTIONS}>;
    initialOptions: string;
};

export type FormattersModuleConfig =  FormatterQuantityConfig<any, any>[];

const FormattersModuleStateModelDecl = AppModuleStateModel.addModel(
    types.compose('FormattersModule',
        types.model({
            defaultFormatterOptions: types.map(types.model({
                id: types.string,
                options: types.frozen()
            }))
        }),
        hasConfig<FormattersModuleConfig>()
    ).volatile((self) => {
        return {
            registeredFormatters: new Map<string, Formatter<any, any>>()
        };
    }).actions((self) => {
        return {
            addFormatter: <VALUE_TYPE, FORMAT_OPTIONS>(
                quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
                formatter: Formatter<VALUE_TYPE, FORMAT_OPTIONS>
            ) => {
                self.registeredFormatters.set(quantity.id, formatter);
            },
            setDefaultFormatterOptions: <VALUE_TYPE, FORMAT_OPTIONS>(
                quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
                options: {
                    id: string,
                    options: Partial<FORMAT_OPTIONS>
                }
            ) => {
                self.defaultFormatterOptions.set(quantity.id, options);
            },
            format: <VALUE_TYPE, FORMAT_OPTIONS>(
                quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
                value: VALUE_TYPE,
                options?: Partial<FORMAT_OPTIONS>
            )  => {
                let formatter = self.registeredFormatters.get(quantity.id);
                if (formatter) {
                    let formatterOptions = self.defaultFormatterOptions.get(quantity.id);
                    if (formatterOptions) {
                        return formatter(value, {
                            ...formatterOptions.options,
                            ...(options)
                        });
                    }
                } else {
                    return value;
                }
            }
        };
    })
    .actions((self) => {
        return {
            afterAttach: () => {
                let formatters = self.config;
                formatters.forEach((formatterConfig) => {
                    self.addFormatter(formatterConfig.quantity, formatterConfig.formatter);
                    let options = formatterConfig.formatterOptions.find((options) => {
                        return options.id === formatterConfig.initialOptions;
                    });
                    if (options) {
                        self.setDefaultFormatterOptions(formatterConfig.quantity, options);
                    }
                });
            }
        };
    })
);

type FormattersModuleStateModelType = typeof FormattersModuleStateModelDecl;
export interface FormattersModuleStateModelInterface extends FormattersModuleStateModelType {}
export const FormattersModuleStateModel: FormattersModuleStateModelInterface = FormattersModuleStateModelDecl;
export interface IFormattersModule extends Instance<FormattersModuleStateModelInterface> {}

export type FormattersModule = AppModule<FormattersModuleStateModelInterface>;

export const DefaultFormattersModule : FormattersModule = {
    stateModel: FormattersModuleStateModel,
    defaultInitState: {
        id: 'formatters',
        config: []
    },
};
