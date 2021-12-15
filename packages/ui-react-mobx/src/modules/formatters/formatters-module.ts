import { observable, action, makeObservable } from 'mobx';

import { FormatterQuantity, Formatter } from '@oidajs/core';

import { AppModule } from '../app-module';


export const DEFAULT_FORMATTERS_MODULE_ID = 'formatters';

export type FormatterOptionsPreset<OPTIONS> = {
    id: string,
    name: string,
    options: OPTIONS
};

export type FormatterQuantityConfig<TYPE, OPTIONS> = {
    quantity: FormatterQuantity<TYPE, OPTIONS>;
    formatter: Formatter<TYPE, OPTIONS>;
    formatterOptionPresets: FormatterOptionsPreset<OPTIONS>[];
    initialOptions: string;
};

export type FormattersModuleConfig = {
    formatters: FormatterQuantityConfig<any, any>[]
};

export type FormattersModuleProps = {
    config: FormattersModuleConfig;
    id?: string;
};

export class FormattersModule extends AppModule {
    readonly config: FormattersModuleConfig;
    @observable.shallow formatters: Map<string, {
        formatter: Formatter<any, any>,
        defaultOptions: {id: string} & Record<string, any>
    }>;

    constructor(props: FormattersModuleProps) {
        super({
            id: props.id || DEFAULT_FORMATTERS_MODULE_ID
        });

        this.config = props.config;
        this.formatters = new Map();

        this.initFromConfig_(props.config);

        makeObservable(this);
    }

    @action
    addFormatter<VALUE_TYPE, FORMAT_OPTIONS>(
        quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
        formatter: Formatter<VALUE_TYPE, FORMAT_OPTIONS>,
        deafultOptions: FORMAT_OPTIONS & {id: string}
    ) {
        this.formatters.set(quantity.id, {
            formatter: formatter,
            defaultOptions: deafultOptions
        });
    }

    @action
    setDefaultFormatterOptions<VALUE_TYPE, FORMAT_OPTIONS>(
        quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
        defaultOptions: FORMAT_OPTIONS & {id: string}
    ) {
        const formatterConfig = this.formatters.get(quantity.id);
        if (!formatterConfig) {
            throw new Error(`FormattersModule: unable to set default options for formatter of type: ${quantity.id}`);
        }
        this.formatters.set(quantity.id, {
            formatter: formatterConfig.formatter,
            defaultOptions: defaultOptions
        });
    }

    getFormatter<VALUE_TYPE, FORMAT_OPTIONS>(quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>) {
        return this.formatters.get(quantity.id) as {
            formatter: Formatter<VALUE_TYPE, FORMAT_OPTIONS>,
            defaultOptions: FORMAT_OPTIONS & {id: string}
        } | undefined;
    }

    format<VALUE_TYPE, FORMAT_OPTIONS>(
        quantity: FormatterQuantity<VALUE_TYPE, FORMAT_OPTIONS>,
        value: VALUE_TYPE,
        options?: Partial<FORMAT_OPTIONS>
    ) {
        let formatterConfig = this.getFormatter(quantity);
        if (formatterConfig) {
            return formatterConfig.formatter(value, {
                ...formatterConfig.defaultOptions,
                ...(options)
            });
        } else {
            return value;
        }
    }

    protected initFromConfig_(config: FormattersModuleConfig) {
        const formatters = config.formatters;

        formatters.forEach((formatterConfig) => {
            let defaultOptions = formatterConfig.formatterOptionPresets.find((options) => {
                return options.id === formatterConfig.initialOptions;
            }) || formatterConfig.formatterOptionPresets[0];
            if (!defaultOptions) {
                throw new Error(`FormattersModule: No options provided for formatter of type ${formatterConfig.quantity.id}`);
            }
            this.addFormatter(formatterConfig.quantity, formatterConfig.formatter, {
                id: defaultOptions.id,
                ...defaultOptions.options
            });
        });
    }
}
