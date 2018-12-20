import { autorun } from 'mobx';

import { SubscriptionTracker, ILayerRenderer, IMapRenderer } from '@oida/core';

import { IMapLayer } from '../../types/layers/map-layer';

export abstract class MapLayerController<T extends ILayerRenderer = ILayerRenderer, U extends IMapLayer = IMapLayer> {

    protected mapLayer_: U;
    protected layerRenderer_: T;
    protected subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.mapLayer_ = config.mapLayer;
        this.layerRenderer_ = null;
    }

    setMapRenderer(mapRenderer: IMapRenderer) {
        this.destroy();
        if (mapRenderer) {
            this.layerRenderer_ = this.createLayerRenderer_(mapRenderer);
            if (this.layerRenderer_) {
                this.bindToLayerState_();
            }
            this.mapLayer_.setRenderer(this.layerRenderer_);
        }
    }

    getLayerRenderer() : T {
        return this.layerRenderer_;
    }

    destroy() {
        if (this.layerRenderer_) {
            this.unbindFromLayerState_();
            this.layerRenderer_.destroy();
            this.layerRenderer_ = null;
        }
    }

    protected abstract createLayerRenderer_(mapRenderer: IMapRenderer): T;

    protected bindToLayerState_() {
        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.layerRenderer_.setVisible(this.mapLayer_.visible);
            this.layerRenderer_.setOpacity(this.mapLayer_.opacity);
        }));
    }

    protected unbindFromLayerState_() {
        this.subscriptionTracker_.unsubscribe();
    }

}
