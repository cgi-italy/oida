import Map from 'ol/Map';
import LayerBase from 'ol/layer/Base';
import Layer from 'ol/layer/Layer';
import GroupLayer from 'ol/layer/Group';
import { getRenderPixel } from 'ol/render';
import RenderEvent from 'ol/render/Event';

import {
    ILayerSwipeInteractionProps,
    LAYER_SWIPE_INTERACTION_ID,
    ILayerSwipeInteractionImplementation,
    IMapLayerRenderer
} from '@oidajs/core';

import { OLMapRenderer } from '../map/ol-map-renderer';
import { OLMapLayer } from '../layers/ol-map-layer';
import { olInteractionsFactory } from './ol-interactions-factory';

export class OLLayerSwipeInteraction implements ILayerSwipeInteractionImplementation {
    private viewer_: Map;
    private currentTarget_: OLMapLayer | undefined;
    private currentSliderPos_: number;
    private isActive_: boolean;
    private layerPreRenderCallback_: (evt: RenderEvent) => void;
    private layerPostRenderCallback_: (evt: RenderEvent) => void;

    constructor(config: ILayerSwipeInteractionProps<OLMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.currentTarget_ = config.targetLayer as OLMapLayer | undefined;
        this.currentSliderPos_ = config.swipePosition;
        this.isActive_ = false;

        this.layerPreRenderCallback_ = (event) => {
            const ctx = event.context as CanvasRenderingContext2D;
            const mapSize = this.viewer_.getSize()!;
            const sliderPosition = this.currentSliderPos_ * mapSize[0];
            const tl = getRenderPixel(event, [sliderPosition, 0]);
            const tr = getRenderPixel(event, [mapSize[0], 0]);
            const bl = getRenderPixel(event, [sliderPosition, mapSize[1]]);
            const br = getRenderPixel(event, mapSize);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tl[0], tl[1]);
            ctx.lineTo(bl[0], bl[1]);
            ctx.lineTo(br[0], br[1]);
            ctx.lineTo(tr[0], tr[1]);
            ctx.closePath();
            ctx.clip();
        };

        this.layerPostRenderCallback_ = (event) => {
            const ctx = event.context as CanvasRenderingContext2D;
            ctx.restore();
        };
    }

    setTargetLayer(layer: IMapLayerRenderer | undefined) {
        if (this.isActive_ && this.currentTarget_) {
            this.unbindFromLayer_(this.currentTarget_.getOLObject());
        }
        this.currentTarget_ = layer as OLMapLayer | undefined;
        if (this.isActive_ && this.currentTarget_) {
            this.bindToLayer_(this.currentTarget_.getOLObject());
        }
        this.viewer_.render();
    }

    setSwipePosition(position: number) {
        this.currentSliderPos_ = position;
        if (this.isActive_ && this.currentTarget_) {
            this.viewer_.render();
        }
    }

    setActive(active) {
        this.isActive_ = active;
        if (this.currentTarget_) {
            if (active) {
                this.bindToLayer_(this.currentTarget_.getOLObject());
            } else {
                this.unbindFromLayer_(this.currentTarget_.getOLObject());
            }
            this.viewer_.render();
        }
    }

    destroy() {
        if (this.isActive_ && this.currentTarget_) {
            this.unbindFromLayer_(this.currentTarget_.getOLObject());
            this.viewer_.render();
        }
    }

    bindToLayer_(layer: LayerBase) {
        if (layer instanceof GroupLayer) {
            layer.getLayersArray().forEach((layer) => {
                this.bindToLayer_(layer);
            });
        } else {
            (layer as Layer).on('prerender', this.layerPreRenderCallback_);
            (layer as Layer).on('postrender', this.layerPostRenderCallback_);
            layer.setZIndex(1000);
        }
    }

    unbindFromLayer_(layer: LayerBase) {
        if (layer instanceof GroupLayer) {
            layer.getLayersArray().forEach((layer) => {
                this.unbindFromLayer_(layer);
            });
        } else {
            (layer as Layer).un('prerender', this.layerPreRenderCallback_);
            (layer as Layer).un('postrender', this.layerPostRenderCallback_);
            // TODO: restore previous zIndex instead of 0
            layer.setZIndex(0);
        }
    }
}

olInteractionsFactory.register(LAYER_SWIPE_INTERACTION_ID, (config) => {
    return new OLLayerSwipeInteraction(config);
});
