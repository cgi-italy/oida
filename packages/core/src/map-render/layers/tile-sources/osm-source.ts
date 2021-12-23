export const OSM_SOURCE_ID = 'osm';

export type OsmSource = {
    id: typeof OSM_SOURCE_ID;
    url?: string;
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [OSM_SOURCE_ID]: OsmSource;
    }
}
