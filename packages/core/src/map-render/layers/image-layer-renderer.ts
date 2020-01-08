import { ILayerRenderer, MapLayerConfig } from './map-layer-renderer';

export type ImageSourceConfig = {
    type: string;
    config: {
        [x: string]: any;
    }
};

export type ImageLayerConfig = {
    onImageLoadStart: () => void;
    onImageLoadEnd: () => void;
    source: ImageSourceConfig
} & MapLayerConfig;

export interface IImageLayerRenderer extends ILayerRenderer {
    updateSource(source?: ImageSourceConfig);
}

export const IMAGE_LAYER_ID = 'image';
