export const TILEJSON_SOURCE_ID = 'tilejson';

export type TileJsonSource = {
    id: typeof TILEJSON_SOURCE_ID;
    tileJsonConfig: any;
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [TILEJSON_SOURCE_ID]: TileJsonSource;
    }
}
