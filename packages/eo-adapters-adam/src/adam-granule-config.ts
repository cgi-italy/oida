import { RasterBandConfig, ValueDomain } from '@oidajs/eo-mobx';

export type AdamGranuleSubdatasetCoverage = Omit<RasterBandConfig, 'domain'> & {
    id: string;
    wcsUrl: string;
    wcsCoverage: string;
    wcsParams: Record<string, string | string[]>;
    domain?: ValueDomain<number>;
};

export type AdamGranuleConfig = {
    id: string;
    name: string;
    color?: string;
    subdatasets: AdamGranuleSubdatasetCoverage[];
    minZoomLevel?: number;
    aoiRequired?: boolean;
};
