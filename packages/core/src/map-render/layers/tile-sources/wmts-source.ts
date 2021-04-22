import { TileGridConfig } from '../tile-layer-renderer';

export const WMTS_SOURCE_ID = 'wmts';

export type WmtsSource = {
    id: typeof WMTS_SOURCE_ID;
    url: string;
    layer: string;
    matrixSet: string;
    style: string;
    subdomains?: string[];
    format?: string;
    dimensions: Record<string, string>;
    requestEncoding?: 'KVP' | 'REST';
    crossOrigin?: 'anonymous' | 'use-credentials';
    tileGrid?: Omit<TileGridConfig, 'isWMTS'>;
    srs?: string;
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [WMTS_SOURCE_ID]: WmtsSource;
    }
}
