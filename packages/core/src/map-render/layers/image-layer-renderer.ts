import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';

export type ImageSourceConfig = {
    type: string;
    config: Record<string, any>;
};

export type ImageLayerRendererConfig = MapLayerRendererConfig & {
    onImageLoadStart: () => void;
    onImageLoadEnd: () => void;
    source?: ImageSourceConfig;
};

export interface IImageLayerRenderer extends IMapLayerRenderer {
    updateSource(source?: ImageSourceConfig);
    forceRefresh(): void;
}

export const IMAGE_LAYER_ID = 'image';

declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [IMAGE_LAYER_ID]: ImageLayerRendererConfig;
    }
}
