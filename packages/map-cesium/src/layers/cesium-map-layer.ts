import PrimitiveCollection from 'cesium/Source/Scene/PrimitiveCollection';
import ImageryLayerCollection from 'cesium/Source/Scene/ImageryLayerCollection';
import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';

import { ILayerRenderer } from '@oida/core';

import { CesiumMapRenderer } from '../map/cesium-map-renderer';

export class CesiumMapLayer implements ILayerRenderer {

    protected mapRenderer_: CesiumMapRenderer;
    protected parent_: CesiumMapLayer | undefined;
    protected visible_: boolean = true;
    protected alpha_: number = 1.0;
    protected imageries_;
    protected primitives_;

    constructor(config) {
        this.mapRenderer_ = config.mapRenderer;

        this.initImageries_();
        this.initPrimitives_();
    }

    setVisible(visible) {
        this.visible_ = visible;
        this.primitives_.show = visible;
        this.updateImageryVisibility_(this.imageries_, this.parent_ ? this.parent_.isVisible() : true);
        this.mapRenderer_.getViewer().scene.requestRender();
    }

    setOpacity(opacity) {
        this.alpha_ = opacity;
        this.updateImageryOpacity_(this.imageries_);
        this.mapRenderer_.getViewer().scene.requestRender();
    }

    setZIndex(zIndex) {
        console.warn('layer zIndex not supported');
    }

    setExtent(extent) {
        console.warn('layer extent not supported');
    }

    setParent(parent) {
        this.parent_ = parent;

        if (this.parent_) {
            this.updateImageryOpacity_(this.imageries_);
            this.updateImageryVisibility_(this.imageries_, this.parent_.isVisible());
        }
    }

    getAlpha() {
        let alpha = this.alpha_;
        if (this.parent_) {
            alpha *= this.parent_.getAlpha();
        }
        return alpha;
    }

    isVisible() {
        if (this.parent_) {
            return this.visible_ && this.parent_.isVisible();
        } else {
            return this.visible_;
        }
    }

    getImageries() {
        return this.imageries_;
    }

    getPrimitives() {
        return this.primitives_;
    }

    destroy() {
        this.imageries_.layerAdded.removeEventListener(this.onAddImageries_, this);
        this.imageries_.layerRemoved.removeEventListener(this.onRemoveImageries_, this);

        this.primitives_.destroy();
        this.imageries_.destroy();
    }

    protected initImageries_() {
        this.imageries_ = new ImageryLayerCollection();

        this.imageries_.layerAdded.addEventListener(this.onAddImageries_, this);
        this.imageries_.layerRemoved.addEventListener(this.onRemoveImageries_, this);
    }

    protected initPrimitives_() {
        this.primitives_ = new PrimitiveCollection({
            destroyPrimitives: false
        });
    }


    protected onAddImageries_(imageries) {

        if (imageries instanceof ImageryLayer || imageries.length) {
            this.mapRenderer_.refreshImageries();
        }
    }

    protected onRemoveImageries_(imageries) {

        if (imageries instanceof ImageryLayer || imageries.length) {
            this.mapRenderer_.refreshImageries();
        }
    }

    protected updateImageryVisibility_(imageries, parentVisible) {

        imageries = imageries || this.imageries_;

        if (imageries instanceof ImageryLayer) {
            imageries.show = this.visible_ && parentVisible;
        } else {
            for (let i = 0; i < imageries.length; ++i) {
                this.updateImageryVisibility_(imageries.get(i), this.visible_ && parentVisible);
            }
        }

    }

    protected updateImageryOpacity_(imageries) {

        imageries = imageries || this.imageries_;

        if (imageries instanceof ImageryLayer) {
            imageries.alpha = this.getAlpha();
        } else {
            for (let i = 0; i < imageries.length; ++i) {
                this.updateImageryOpacity_(imageries.get(i));
            }
        }

    }
}
