
import LayerBase from 'ol/layer/Base';

import { ILayerRenderer } from '@oida/core';

import { OLMapRenderer } from '../map/ol-map-renderer';

export abstract class OLMapLayer<T extends LayerBase = LayerBase> implements ILayerRenderer {

    protected mapRenderer_: OLMapRenderer;
    protected olImpl_: T;

    constructor(config) {
        this.mapRenderer_ = config.mapRenderer;
        this.olImpl_ = this.createOLObject_(config.mapLayer);
    }

    setVisible(visible) {
        this.olImpl_.setVisible(visible);
    }

    setOpacity(opacity) {
        this.olImpl_.setOpacity(opacity);
    }

    setZIndex(zIndex) {
        this.olImpl_.setZIndex(zIndex);
    }

    destroy() {
        this.destroyOLObject_();
    }

    getOLObject() {
        return this.olImpl_;
    }

    protected abstract createOLObject_(config);
    protected abstract destroyOLObject_();

}

