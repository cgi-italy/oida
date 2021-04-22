import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';

export type GeoImageLayerSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
export type GeoImageLayerFootprint =  Array<number[]>;

export type GeoImageLayerRendererConfig = MapLayerRendererConfig & {
    source: GeoImageLayerSource | undefined;
    srs?: string;
    footprint: GeoImageLayerFootprint;
    dynamicFootprint?: boolean;
};

export interface IGeoImageLayerRendererConstructor {
    new(props: GeoImageLayerRendererConfig & MapLayerRendererConfig): IGeoImageLayerRenderer;
}

export interface IGeoImageLayerRenderer extends IMapLayerRenderer {
    updateSource(source: GeoImageLayerSource | undefined): void;
    updateFootprint(footprint: GeoImageLayerFootprint): void;
    forceRefresh(): void;
}

export const GEO_IMAGE_LAYER_ID = 'geo_image';

declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [GEO_IMAGE_LAYER_ID]: GeoImageLayerRendererConfig;
    }
}
