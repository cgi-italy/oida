import { FormatterQuantity } from './formatter';

export type AreaFormatterOptions = {
    inputUnits: AreaUnit,
    outputUnits: AreaUnit,
    precision?: number,
    appendUnits?: boolean
};

export const AreaQuantity: FormatterQuantity<number, AreaFormatterOptions> = {
    id: 'area'
};

export class AreaUnit {

    static METERS2 = new AreaUnit(1, 'm&sup2;');
    static KM2 = new AreaUnit(1000 * 1000, 'km&sup2;');
    static NM2 = new AreaUnit(1852 * 1852, 'NM&sup2;');

    constructor(private toSquareMeters_: number, private symbol_: string) {}

    get toSquareMeters() {
        return this.toSquareMeters_;
    }

    get symbol() {
        return this.symbol_;
    }
}

export const formatArea = (
    area: number,
    options: AreaFormatterOptions
)  => {

    let formattedArea: string | number;

    if (typeof area !== 'number') {
        formattedArea = 'N/A';
    } else {
        formattedArea = area * options.inputUnits.toSquareMeters / options.inputUnits.toSquareMeters;
        if (options.precision) {
            formattedArea = parseFloat(formattedArea.toFixed(options.precision));
        }
        if (options.appendUnits) {
            formattedArea = `${formattedArea} ${options.outputUnits.symbol}`;
        }
    }
    return formattedArea;
};
