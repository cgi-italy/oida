
import LayerBase from 'ol/layer/Base';
import { transformExtent } from 'ol/proj';

import { ILayerRenderer } from '@oida/core';

import { OLMapRenderer } from '../map/ol-map-renderer';

export abstract class OLMapLayer<T extends LayerBase = LayerBase> implements ILayerRenderer {

    protected mapRenderer_: OLMapRenderer;
    protected olImpl_: T;

    constructor(config) {
        let {mapRenderer, mapLayer, ...other} = config;

        this.mapRenderer_ = mapRenderer;
        this.olImpl_ = this.createOLObject_({
            ...mapLayer,
            ...other
        });
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

    setExtent(extent) {

        if (extent) {
            let projection = this.mapRenderer_.getViewer().getView().getProjection();

            if (projection.getCode() !== 'EPSG:4326') {
                extent = transformExtent(extent, 'EPSG:4326', projection);
                if (isNaN(extent[0]) || isNaN(extent[1]) || isNaN(extent[2]) || isNaN(extent[3])) {
                    extent = undefined;
                }
            }
        }

        this.olImpl_.setExtent(extent);
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

