import { CesiumWidget, ImageryLayer, ImageryLayerCollection, SplitDirection } from 'cesium';

import {
    ILayerSwipeInteractionProps,
    LAYER_SWIPE_INTERACTION_ID,
    ILayerSwipeInteractionImplementation,
    IMapLayerRenderer,
    TILE_LAYER_ID,
    GROUP_LAYER_ID
} from '@oidajs/core';

import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { CesiumMapLayer } from '../layers/cesium-map-layer';
import { cesiumInteractionsFactory } from './cesium-interactions-factory';

export class CesiumLayerSwipeInteraction implements ILayerSwipeInteractionImplementation {
    private viewer_: CesiumWidget;
    private currentTarget_: CesiumMapLayer | undefined;
    private isActive_: boolean;

    constructor(config: ILayerSwipeInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.currentTarget_ = config.targetLayer as CesiumMapLayer | undefined;
        this.viewer_.scene.splitPosition = config.swipePosition;
        this.isActive_ = false;
    }

    setTargetLayer(layer: IMapLayerRenderer | undefined) {
        if (this.isActive_ && this.currentTarget_) {
            this.unbindFromLayerImageries_(this.currentTarget_.getImageries());
            this.currentTarget_.setZIndex(0);
        }
        this.currentTarget_ = layer as CesiumMapLayer | undefined;
        if (this.isActive_ && this.currentTarget_) {
            this.bindToLayerImageries_(this.currentTarget_.getImageries());
            this.currentTarget_.setZIndex(1000);
        }
        this.viewer_.scene.requestRender();
    }

    setSwipePosition(position: number) {
        this.viewer_.scene.splitPosition = position;
        if (this.isActive_ && this.currentTarget_) {
            this.viewer_.scene.requestRender();
        }
    }

    getSupportedLayerTypes() {
        return [TILE_LAYER_ID, GROUP_LAYER_ID];
    }

    setActive(active) {
        this.isActive_ = active;
        if (this.currentTarget_) {
            if (active) {
                this.bindToLayerImageries_(this.currentTarget_.getImageries());
                this.currentTarget_.setZIndex(1000);
            } else {
                this.unbindFromLayerImageries_(this.currentTarget_.getImageries());
                this.currentTarget_.setZIndex(0);
            }
            this.viewer_.scene.requestRender();
        }
    }

    destroy() {
        if (this.isActive_ && this.currentTarget_) {
            this.unbindFromLayerImageries_(this.currentTarget_.getImageries());
            this.currentTarget_.setZIndex(0);
            if (this.viewer_ && this.viewer_.scene) {
                this.viewer_.scene.requestRender();
            }
        }
    }

    bindToLayerImageries_(imageries: ImageryLayer | ImageryLayerCollection) {
        if (imageries instanceof ImageryLayerCollection) {
            // @ts-ignore: TODO: extend the ImageryLayerCollection type
            imageries._layers.forEach((imageries) => {
                this.bindToLayerImageries_(imageries);
            });
        } else {
            imageries.splitDirection = SplitDirection.RIGHT;
        }
    }

    unbindFromLayerImageries_(imageries: ImageryLayer | ImageryLayerCollection) {
        if (imageries instanceof ImageryLayerCollection) {
            // @ts-ignore: TODO: extend the ImageryLayerCollection type
            imageries._layers.forEach((imageries) => {
                this.unbindFromLayerImageries_(imageries);
            });
        } else {
            imageries.splitDirection = SplitDirection.NONE;
        }
    }
}

cesiumInteractionsFactory.register(LAYER_SWIPE_INTERACTION_ID, (config) => {
    return new CesiumLayerSwipeInteraction(config);
});
