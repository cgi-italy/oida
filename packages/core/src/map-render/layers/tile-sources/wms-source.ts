import { TileGridConfig } from '../tile-layer-renderer';

export const WMS_SOURCE_ID = 'wms';

export type WmsSource = {
    id: typeof WMS_SOURCE_ID;
    url: string;
    layers: string;
    subdomains?: string[];
    parameters?: Record<string, string>;
    crossOrigin?: 'anonymous' | 'use-credentials';
    tileGrid?: Omit<TileGridConfig, 'isWMTS'>;
    srs?: string;
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [WMS_SOURCE_ID]: WmsSource;
    }
}
