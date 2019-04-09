export type FormatterQuantity<VALUE_TYPE, FORMATTER_OPTIONS> = {
    id: string;
};

export type Formatter<VALUE_TYPE, FORMAT_OPTIONS> = (value: VALUE_TYPE, options: FORMAT_OPTIONS) => any;
