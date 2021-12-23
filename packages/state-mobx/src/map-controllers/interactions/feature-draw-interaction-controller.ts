import { autorun } from 'mobx';

import { MapInteractionController } from './map-interaction-controller';

import { IFeatureDrawInteractionImplementation, FEATURE_DRAW_INTERACTION_ID } from '@oidajs/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { FeatureDrawInteraction } from '../../models/map/interactions/feature-draw-interaction';

export class FeatureDrawInteractionController extends MapInteractionController<
    IFeatureDrawInteractionImplementation,
    FeatureDrawInteraction
> {
    constructor(config) {
        super(config);
    }

    protected bindToInteractionState_() {
        super.bindToInteractionState_();
        this.subscriptionTracker_.addSubscription(
            autorun(() => {
                this.interactionImpl_!.setDrawMode(this.interaction_.drawMode, this.interaction_.drawOptions);
            })
        );
    }
}

interactionControllersFactory.register(FEATURE_DRAW_INTERACTION_ID, (config) => {
    return new FeatureDrawInteractionController(config);
});
