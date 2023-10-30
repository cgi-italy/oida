import { reaction } from 'mobx';

import { ILayerSwipeInteractionImplementation, LAYER_SWIPE_INTERACTION_ID } from '@oidajs/core';

import { MapInteractionController } from './map-interaction-controller';
import { interactionControllersFactory } from './interaction-controllers-factory';
import { LayerSwipeInteraction } from '../../models/map/interactions/layer-swipe-interaction';

export class LayerSwipeInteractionController extends MapInteractionController<ILayerSwipeInteractionImplementation, LayerSwipeInteraction> {
    constructor(config) {
        super(config);
    }

    protected bindToInteractionState_() {
        super.bindToInteractionState_();
        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.interaction_.swipePosition,
                (swipePosition) => this.interactionImpl_?.setSwipePosition(swipePosition)
            )
        );
        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.interaction_.targetLayer,
                (targetLayer) => this.interactionImpl_?.setTargetLayer(targetLayer?.renderer)
            )
        );
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            swipePosition: this.interaction_.swipePosition,
            targetLayer: this.interaction_.targetLayer?.renderer,
            onSwipePositionChange: (swipePosition: number) => {
                this.interaction_.setSwipePosition(swipePosition);
            }
        };
    }
}

interactionControllersFactory.register(LAYER_SWIPE_INTERACTION_ID, (config) => {
    return new LayerSwipeInteractionController(config);
});
