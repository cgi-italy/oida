import { useObserver } from 'mobx-react';

import { FormatterQuantity } from '@oida/core';

import { IFormattersModule } from '../formatters-module';

import { useFormattersModuleState } from '../use-formatters-module-state';

export type FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS> = {
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>;
    formatterOptions: Array<{
        id: string,
        name: string,
        options: Partial<FORMATTER_OPTIONS>
    }>
    formattersModule: IFormattersModule
};

export const useFormatSelectorBase = <VALUE_TYPE, FORMATTER_OPTIONS>(props: FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS>) => {

    let { quantity, formatterOptions, formattersModule} = props;

    let selectedOptions = formattersModule.defaultFormatterOptions.get(quantity.id);

    return useObserver(() => ({
        items: formatterOptions.map((options) => {
            return {
                value: options.id,
                ...options
            };
        }),
        value: selectedOptions ? selectedOptions.id : '',
        onSelect: (id) => {

            let options = formatterOptions.find((options) => {
                return options.id === id;
            });

            if (options) {
                formattersModule.setDefaultFormatterOptions(quantity, options);
            }
        }
    }));
};

export const useFormatSelector =
<VALUE_TYPE, FORMATTER_OPTIONS>(quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>, formatterModule?) => {
    let formattersModule = useFormattersModuleState(formatterModule);

    let quantityConfig = formattersModule.config.find((item) => {
        return item.quantity === quantity;
    });

    if (!quantityConfig) {
        throw 'No config for quantity';
    }
    return useFormatSelectorBase({
        formattersModule: formattersModule,
        quantity: quantity,
        formatterOptions: quantityConfig.formatterOptions
    });
};
