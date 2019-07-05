import { useEffect, useState } from 'react';

import { onPatch } from 'mobx-state-tree';

import { FormatterQuantity } from '@oida/core';

import { IFormattersModule } from '../formatters-module';

import { useFormattersModuleState } from '../use-formatters-module-state';

export type FormatterProps<VALUE_TYPE, FORMATTER_OPTIONS> = {
    quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>;
    formattersModule: IFormattersModule
};

export const useFormatterBase = <VALUE_TYPE, FORMATTER_OPTIONS>(props: FormatterProps<VALUE_TYPE, FORMATTER_OPTIONS>) => {

    let { quantity, formattersModule} = props;

    const [formatter, setFormatter] = useState(() => formattersModule.format.bind(formattersModule, quantity));

    useEffect(() => {

        const disposer = onPatch(formattersModule.defaultFormatterOptions, (patch) => {

            if (patch.path === `/${quantity.id}/options`) {
                //the patch has not been applied yet. Defer state update
                setTimeout(() => {
                    setFormatter(() => formattersModule.format.bind(formattersModule, quantity));
                }, 0);
            }
        });

        return () => {
            disposer();
        };

    }, []);

    return formatter;

};

export const useFormatter = <VALUE_TYPE, FORMATTER_OPTIONS>
(quantity: FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS>, formatterModule?) => {
    let formattersModule = useFormattersModuleState(formatterModule);

    return useFormatterBase({
        formattersModule: formattersModule,
        quantity: quantity,
    });
};

