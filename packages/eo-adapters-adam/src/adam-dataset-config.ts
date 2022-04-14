import {
    DatasetDimension,
    ValueDomain,
    CategoricalDomain,
    RasterBandConfig,
    RasterBandPreset,
    RasterBandGroup,
    ProductSearchRecord,
    VectorFeaturePropertyDescriptor
} from '@oidajs/eo-mobx';

export type AdamDatasetDimension = DatasetDimension<ValueDomain<number | Date> | CategoricalDomain<number | string>> & {
    wcsSubset: {
        id: string;
        idx?: number;
    };
    wcsResponseKey?: string;
    tarFilenameRegex?: RegExp;
    preventSeries?: boolean;
};

export type AdamDatasetSingleBandCoverage = Omit<RasterBandConfig, 'domain'> & {
    wcsCoverage: string;
    subdataset?: string;
    wcsSubset?: {
        id: string;
        value: string;
        idx?: number;
    };
    domain?: ValueDomain<number>;
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

export type AdamWcsDatasetConfig = {
    id: string;
    type: AdamDatasetType;
    name: string;
    color?: string;
    coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage;
    coverageExtent?: {
        bbox: number[];
        srs: string;
        srsDef?: string;
    };
    requestExtentOffset?: number[];
    dimensions?: AdamDatasetDimension[];
    fixedTime?: Date | boolean;
    renderMode: AdamDatasetRenderMode;
    cswCollection?: string;
    productSearchRecordContent?: (item: ProductSearchRecord) => any;
    minZoomLevel?: number;
    aoiRequired?: boolean;
    timeRange?: {
        start: Date;
        end: Date;
    };
    verticalScaleConfig?: {
        min: number;
        max: number;
        step?: number;
        default?: number;
    };
};

export type AdamVectorDatasetConfig = {
    id: string;
    type: 'vector';
    name: string;
    color?: string;
    bbox: number[];
    dimensions?: DatasetDimension<ValueDomain<number | Date> | CategoricalDomain<number | string>>[];
    featureProperties?: VectorFeaturePropertyDescriptor[] | Record<string, VectorFeaturePropertyDescriptor[]>;
    fixedTime?: Date | boolean;
    productSearchRecordContent?: (item: ProductSearchRecord) => any;
};

export type AdamDatasetConfig = AdamWcsDatasetConfig | AdamVectorDatasetConfig;

export function isMultiBandCoverage(
    coverages: AdamDatasetSingleBandCoverage[] | AdamDatasetMultiBandCoverage
): coverages is AdamDatasetMultiBandCoverage {
    return !Array.isArray(coverages);
}
