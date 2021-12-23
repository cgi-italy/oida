export type NumberFormatOptions = {
    /**
     * maximum length of the output formatted string.
     * It will use scientific notation if necessary.
     **/
    maxLength?: number;
    /**
     * maximum number of decimal places.
     * it will round the number if necessary
     */
    precision?: number;
};

export const formatNumber = (value: number | string, options?: NumberFormatOptions) => {
    if (typeof value === 'string') {
        try {
            value = parseFloat(value);
        } catch (e) {
            return value as string;
        }
    }
    let formattedValue = value.toString();
    if (typeof options?.maxLength === 'number') {
        if (formattedValue.length > options.maxLength) {
            formattedValue = value.toPrecision(options.maxLength);
        }
    }
    if (typeof options?.precision === 'number') {
        if (/e[+-]?[0-9]+/.test(formattedValue)) {
            formattedValue = value.toExponential(options.precision);
        } else {
            const fractionalString = formattedValue.split('.')[1];
            if (fractionalString && fractionalString.length > options.precision) {
                formattedValue = value.toFixed(options.precision);
            }
        }
    }
    return formattedValue;
};
