import {
    DatasetDimension, ValueDomain, CategoricalDomain, RasterBandConfig, RasterBandPreset, RasterBandGroup, ProductSearchRecord
} from '@oida/eo-mobx';

export type AdamDatasetDimension = DatasetDimension<ValueDomain<number | Date> | CategoricalDomain<number | string>> & {
    wcsSubset: {
        id: string;
        idx?: number;
    };
    wcsResponseKey: string;
    tarFilenameRegex: RegExp;
};


export type AdamDatasetSingleBandCoverage = Omit<RasterBandConfig, 'domain'> & {
    wcsCoverage: string;
    wcsSubset?: {
        id: string;
        value: string;
        idx?: number;
    };
    domain?: ValueDomain<number>
};


export type AdamDatasetCoverageBand = Omit<RasterBandConfig, 'id' | 'domain'> & {
    idx: number;
    domain?: ValueDomain<number>;
};

export type AdamDatasetMultiBandCoveragePreset = RasterBandPreset & {
    bands: number[];
};

export type AdamDatasetMultiBandCoverage = {
    id: string;
    name: string;
    wcsCoverage: string;
    isTrueColor?: boolean;
    bands: AdamDatasetCoverageBand[];
    bandGroups: RasterBandGroup[];
    presets: AdamDatasetMultiBandCoveragePreset[];
};


export enum AdamDatasetRenderMode {
    ServerSide = 'ServerSide',
    ClientSide = 'ClientSide'
}


export type AdamDatasetType = 'raster' | 'volume' | 'vertical_profile';

export type AdamDatasetConfig = {
    id: string;
    type: AdamDatasetType;
    name: string,
    color: string,
    coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;
    coverageSrs: string;
    srsDef?: string;
    coverageExtent: number[];
    requestExtentOffset?: number[];
    dimensions?: AdamDatasetDimension[];
    fixedTime?: Date;
    renderMode: AdamDatasetRenderMode;
    cswCollection?: string;
    productSearchRecordContent?: (item: ProductSearchRecord) => any;
    minZoomLevel?: number;
};

export function isMultiBandCoverage(
    coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage
): coverages is AdamDatasetMultiBandCoverage {
    return !Array.isArray(coverages);
}
