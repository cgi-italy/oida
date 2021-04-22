import { TileGridConfig } from '../tile-layer-renderer';

export const XYZ_SOURCE_ID = 'xyz';

export type XyzSource = {
    id: typeof XYZ_SOURCE_ID;
    url: string;
    subdomains?: string[];
    srs?: string;
    tileGrid?: Omit<TileGridConfig, 'isWMTS'>;
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [XYZ_SOURCE_ID]: XyzSource;
    }
}
