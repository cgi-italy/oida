import { FormatterQuantity } from './formatter';
import { formatNumber, NumberFormatOptions } from './utils';

export class LengthUnit {

    static METERS = new LengthUnit(1, 'm');
    static KM = new LengthUnit(1000, 'km');
    static NM = new LengthUnit(1852, 'NM');

    constructor(private toMeters_: number, private symbol_: string) {}

    get toMeters() {
        return this.toMeters_;
    }

    get symbol() {
        return this.symbol_;
    }
}

export type LengthFormatterOptions = {
    inputUnits: LengthUnit,
    outputUnits: LengthUnit,
    appendUnits?: boolean
} & NumberFormatOptions;


export const LengthQuantity: FormatterQuantity<number, LengthFormatterOptions> = {
    id: 'length'
};


export const formatLength = (
    length: number,
    options: LengthFormatterOptions
)  => {

    let formattedLength: string | number;

    if (typeof length !== 'number') {
        formattedLength = 'N/A';
    } else {
        formattedLength = length * options.inputUnits.toMeters / options.outputUnits.toMeters;
        formattedLength = formatNumber(formattedLength, options);
        if (options.appendUnits) {
            formattedLength = `${formattedLength} ${options.outputUnits.symbol}`;
        }
    }
    return formattedLength;
};

