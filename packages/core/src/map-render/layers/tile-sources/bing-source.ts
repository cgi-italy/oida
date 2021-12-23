export const BING_SOURCE_ID = 'bing';

export type BingSource = {
    id: typeof BING_SOURCE_ID;
    key: string;
    imagerySet?: 'Aerial' | 'AerialWithLabelsOnDemand' | 'RoadOnDemand' | 'CanvasDark' | 'CanvasLight' | 'CanvasGrey';
};

declare module './tile-source' {
    export interface ITileSourceDefinitions {
        [BING_SOURCE_ID]: BingSource;
    }
}
