import { FormatterQuantity } from '@oidajs/core';

import { useSelector } from '../../../core';
import { FormattersModule, FormatterOptionsPreset } from '../formatters-module';
import { useFormattersModule } from './use-formatters-module';

export type FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS> = {
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>;
    optionsPresets: FormatterOptionsPreset<FORMATTER_OPTIONS>[];
    formattersModule: FormattersModule;
};

export const useFormatSelectorBase = <VALUE_TYPE, FORMATTER_OPTIONS>(props: FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS>) => {
    const { quantity, optionsPresets, formattersModule } = props;

    return useSelector(() => {
        const value = formattersModule.getFormatter(quantity)?.defaultOptions.id;

        return {
            items: optionsPresets.map((options) => {
                return {
                    value: options.id,
                    ...options
                };
            }),
            value: value,
            onSelect: (id) => {
                const preset = optionsPresets.find((preset) => {
                    return preset.id === id;
                });

                if (preset) {
                    formattersModule.setDefaultFormatterOptions(quantity, {
                        id: preset.id,
                        ...preset.options
                    });
                }
            }
        };
    });
};

export const useFormatSelector = <VALUE_TYPE, FORMATTER_OPTIONS>(
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>,
    formatterModuleId?: string
) => {
    const formattersModule = useFormattersModule(formatterModuleId);

    const quantityConfig = formattersModule.config.formatters.find((item) => {
        return item.quantity === quantity;
    });

    if (!quantityConfig) {
        throw new Error(`useFormatSelector: no config found for quantity of type: ${quantity.id}`);
    }
    return useFormatSelectorBase({
        formattersModule: formattersModule,
        quantity: quantity,
        optionsPresets: quantityConfig.formatterOptionPresets
    });
};
