import { FormatterQuantity } from './formatter';
import { formatNumber, NumberFormatOptions } from './utils';

export type FilesizeFormatterOptions = {
    inputUnits: FilesizeUnit,
    outputUnits?: FilesizeUnit,
    appendUnits?: boolean
} & NumberFormatOptions;

export const FilesizeQuantity: FormatterQuantity<number, FilesizeFormatterOptions> = {
    id: 'filesize'
};

export class FilesizeUnit {

    static Byte = new FilesizeUnit(1, 'B');
    static KB = new FilesizeUnit(1024, 'KB');
    static MB = new FilesizeUnit(1024 * 1024, 'MB');
    static GB = new FilesizeUnit(1024 * 1024 * 1024, 'GB');
    static TB = new FilesizeUnit(1024 * 1024 * 1024 * 1024, 'TB');

    constructor(private toBytes_: number, private symbol_: string) {}

    get toBytes() {
        return this.toBytes_;
    }

    get symbol() {
        return this.symbol_;
    }
}

export const formatFilesize = (
    filesize: number,
    options: FilesizeFormatterOptions
)  => {

    let formattedSize: string | number;

    if (typeof filesize !== 'number') {
        formattedSize = 'N/A';
    } else {
        let outputUnits = options.outputUnits;
        if (!outputUnits) {
            let byteSize = filesize * options.inputUnits.toBytes;
            if (byteSize < FilesizeUnit.KB.toBytes) {
                outputUnits = FilesizeUnit.Byte;
            } else if (byteSize < FilesizeUnit.MB.toBytes) {
                outputUnits = FilesizeUnit.KB;
            } else if (byteSize < FilesizeUnit.GB.toBytes) {
                outputUnits = FilesizeUnit.MB;
            } else if (byteSize < FilesizeUnit.TB.toBytes) {
                outputUnits = FilesizeUnit.GB;
            } else {
                outputUnits = FilesizeUnit.TB;
            }
        }

        formattedSize = filesize * options.inputUnits.toBytes / outputUnits.toBytes;
        formattedSize = formatNumber(formattedSize, options);
        if (options.appendUnits) {
            formattedSize = `${formattedSize} ${outputUnits.symbol}`;
        }
    }
    return formattedSize;
};

