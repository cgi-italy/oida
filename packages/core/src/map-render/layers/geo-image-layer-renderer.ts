import { ILayerRenderer, MapLayerConfig } from './map-layer-renderer';

export type GeoImageLayerSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
export type GeoImageLayerFootprint =  Array<number[]>;

export type GeoImageLayerConfig = {
    source: GeoImageLayerSource | undefined;
    srs?: string;
    footprint: GeoImageLayerFootprint;
    dynamicFootprint?: boolean;
} & MapLayerConfig;

export interface IGeoImageLayerRendererConstructor {
    new(props: GeoImageLayerConfig): IGeoImageLayerRenderer;
}

export interface IGeoImageLayerRenderer extends ILayerRenderer {
    updateSource(source: GeoImageLayerSource | undefined): void;
    updateFootprint(footprint: GeoImageLayerFootprint): void;
    forceRefresh(): void;
}

export const GEO_IMAGE_LAYER_ID = 'geo_image';
