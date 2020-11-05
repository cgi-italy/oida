import { autorun } from 'mobx';

import { SubscriptionTracker, ILayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayer } from '../../models/map/layers/map-layer';

export abstract class MapLayerController<T extends ILayerRenderer = ILayerRenderer, U extends MapLayer = MapLayer> {

    protected mapLayer_: U;
    protected layerRenderer_: T | undefined;
    protected subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.mapLayer_ = config.mapLayer;
    }

    setMapRenderer(mapRenderer: IMapRenderer | undefined) {
        this.destroy();
        if (mapRenderer) {
            this.layerRenderer_ = this.createLayerRenderer_(mapRenderer);
            if (this.layerRenderer_) {
                this.bindToLayerState_();
            }
            this.mapLayer_.setRenderer(this.layerRenderer_);
        }
    }

    getLayerRenderer() {
        return this.layerRenderer_;
    }

    destroy() {
        if (this.layerRenderer_) {
            this.unbindFromLayerState_();
            this.layerRenderer_.destroy();
            delete this.layerRenderer_;
        }
    }

    protected abstract createLayerRenderer_(mapRenderer: IMapRenderer): T;

    protected bindToLayerState_() {

        const layerRenderer = this.layerRenderer_!;

        this.subscriptionTracker_.addSubscription(autorun(() => {
            layerRenderer.setVisible(this.mapLayer_.visible.value);
            layerRenderer.setOpacity(this.mapLayer_.opacity.value);
        }));

        this.subscriptionTracker_.addSubscription(autorun(() => {
            layerRenderer.setZIndex(this.mapLayer_.zIndex || 0);
        }));

        this.subscriptionTracker_.addSubscription(autorun(() => {
            layerRenderer.setExtent(this.mapLayer_.extent);
        }));
    }

    protected unbindFromLayerState_() {
        this.subscriptionTracker_.unsubscribe();
    }

}
