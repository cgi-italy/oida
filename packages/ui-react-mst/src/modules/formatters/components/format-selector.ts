import React from 'react';
import { observer } from 'mobx-react';

import { FormatterQuantity, Formatter } from '@oida/core';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';

import { FormattersModule, DefaultFormattersModule, IFormattersModule } from '../formatters-module';
import { injectFromModuleState, injectFromModuleConfig } from '../../with-app-module';

export type FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS> = {
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>;
    formatterOptions: Array<{
        id: string,
        name: string,
        options: Partial<FORMATTER_OPTIONS>
    }>
    render: ChoiceSelectorRenderer<any>;
    formattersModule: IFormattersModule
};

class FormatSelectorBase<VALUE_TYPE, FORMATTER_OPTIONS> extends React.Component<FormatSelectorProps<VALUE_TYPE, FORMATTER_OPTIONS>> {

    onFormatSelect(id) {
        let { quantity, formatterOptions, formattersModule} = this.props;

        let options = formatterOptions.find((options) => {
            return options.id === id;
        });

        formattersModule.setDefaultFormatterOptions(quantity, options);
    }

    render() {

        let { render, quantity, formatterOptions, formattersModule} = this.props;

        let value = formattersModule.defaultFormatterOptions.get(quantity.id).id;

        let items = formatterOptions.map((options) => {
            return Object.assign({
                value: options.id,
            }, options);
        });

        return render({
            value: value,
            items: items,
            onSelect: this.onFormatSelect.bind(this)
        });
    }
}

export const FormatSelector = observer(FormatSelectorBase);

export const injectFormatSelectorsStateFromModule =
(formattersModule: FormattersModule) => injectFromModuleState(formattersModule, (moduleState) => {
    return {
        formattersModule: moduleState
    };
});

export const injectFormattersFromModuleConfig =
(formattersModule: FormattersModule, quantity) => injectFromModuleConfig(formattersModule, (moduleConfig) => {

    let quantityConfig = moduleConfig.find((item) => {
        return item.quantity === quantity;
    });

    return {
        formatterOptions: quantityConfig.formatterOptions
    };
});

export const FormatSelectorS = injectFormatSelectorsStateFromModule(DefaultFormattersModule)(FormatSelector);

export const FormatSelectorSC =
(quantity) => injectFormattersFromModuleConfig(DefaultFormattersModule, quantity)(FormatSelectorS);
