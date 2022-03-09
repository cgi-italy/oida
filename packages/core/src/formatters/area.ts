import { FormatterQuantity } from './formatter';
import { formatNumber, NumberFormatOptions } from './utils';

export type AreaFormatterOptions = {
    inputUnits: AreaUnit;
    outputUnits: AreaUnit;
    appendUnits?: boolean;
} & NumberFormatOptions;

export const AreaQuantity: FormatterQuantity<number, AreaFormatterOptions> = {
    id: 'area'
};

export class AreaUnit {
    static METERS2 = new AreaUnit(1, `m${String.fromCharCode(178)}`);
    static KM2 = new AreaUnit(1000 * 1000, `km${String.fromCharCode(178)}`);
    static NM2 = new AreaUnit(1852 * 1852, `NM${String.fromCharCode(178)}`);

    constructor(private toSquareMeters_: number, private symbol_: string) {}

    get toSquareMeters() {
        return this.toSquareMeters_;
    }

    get symbol() {
        return this.symbol_;
    }
}

export const formatArea = (area: number, options: AreaFormatterOptions) => {
    let formattedArea: string | number;

    if (typeof area !== 'number') {
        formattedArea = 'N/A';
    } else {
        formattedArea = (area * options.inputUnits.toSquareMeters) / options.outputUnits.toSquareMeters;
        formattedArea = formatNumber(formattedArea, options);
        if (options.appendUnits) {
            formattedArea = `${formattedArea} ${options.outputUnits.symbol}`;
        }
    }
    return formattedArea;
};
