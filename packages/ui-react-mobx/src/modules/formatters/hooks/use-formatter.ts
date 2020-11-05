import { useEffect, useState } from 'react';
import { reaction } from 'mobx';

import { FormatterQuantity } from '@oida/core';

import { FormattersModule } from '../formatters-module';
import { useFormattersModule } from './use-formatters-module';


export type FormatterProps<VALUE_TYPE, FORMATTER_OPTIONS> = {
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>;
    formattersModule: FormattersModule
};

const useFormatterBase = <VALUE_TYPE, FORMATTER_OPTIONS>(props: FormatterProps<VALUE_TYPE, FORMATTER_OPTIONS>) => {

    let { quantity, formattersModule} = props;

    const [formatter, setFormatter] = useState<(value: VALUE_TYPE, options: Partial<FORMATTER_OPTIONS>) => any>(
        () => formattersModule.format.bind(formattersModule, quantity)
    );

    useEffect(() => {

        const disposer = reaction(() => formattersModule.getFormatter(quantity), (formatterConfig) => {
            setFormatter(() => formattersModule.format.bind(formattersModule, quantity));
        });

        return () => {
            disposer();
        };

    }, []);

    return formatter;

};

export const useFormatter = <VALUE_TYPE, FORMATTER_OPTIONS>
(quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>, formatterModuleId?: string) => {
    let formattersModule = useFormattersModule(formatterModuleId);

    return useFormatterBase({
        formattersModule: formattersModule,
        quantity: quantity,
    });
};

