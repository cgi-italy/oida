import ImageLayer from 'ol/layer/Image';

import { IMAGE_LAYER_ID, IImageLayerRenderer, ImageLayerConfig, ImageSourceConfig } from '@oida/core';

import { olImageSourceFactory } from './image-sources/ol-image-source-factory';

import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLImageLayer extends OLMapLayer<ImageLayer> implements IImageLayerRenderer {

    protected onImageLoadStart_;
    protected onImageLoadEnd_;

    constructor(config: ImageLayerConfig) {
        super(config);
    }

    updateSource(source?: ImageSourceConfig) {

        let olSource;
        if (source) {
            olSource = this.createImageSource_(source);
        }

        let prevSource = this.olImpl_.getSource();
        if (prevSource) {
            prevSource.un('imageloadstart', this.onImageLoadStart_);
            prevSource.un('imageloadend', this.onImageLoadEnd_);
            prevSource.un('imageloaderror', this.onImageLoadEnd_);
        }

        this.olImpl_.setSource(olSource || null);

    }

    protected createOLObject_(config: ImageLayerConfig) {

        this.onImageLoadStart_ = () => {
            config.onImageLoadStart();
        };

        this.onImageLoadEnd_ = () => {
            config.onImageLoadEnd();
        };

        return new ImageLayer({
            source: config.source ? this.createImageSource_(config.source) : undefined,
            extent: config.extent,
            zIndex: config.zIndex || 0
        });

    }

    protected destroyOLObject_() {
    }

    protected createImageSource_(source: ImageSourceConfig) {
        let olSource = olImageSourceFactory.create(source.type, {
            ...source.config
        });

        if (olSource) {
            olSource.on('imageloadstart', this.onImageLoadStart_);
            olSource.on('imageloadend', this.onImageLoadEnd_);
            olSource.on('imageloaderror', this.onImageLoadEnd_);
        }

        return olSource;
    }

}

olLayersFactory.register(IMAGE_LAYER_ID, (config) => {
    return new OLImageLayer(config);
});