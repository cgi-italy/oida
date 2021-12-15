import { reaction } from 'mobx';

import { MapInteractionController } from './map-interaction-controller';

import { IFeatureHoverInteractionImplementation, FEATURE_HOVER_INTERACTION_ID, IFeature } from '@oidajs/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { FeatureHoverInteraction } from '../../models/map/interactions/feature-hover-interaction';
import { FeatureData } from '../layers/feature-layer-controller';


export class FeatureHoverInteractionController extends
    MapInteractionController<IFeatureHoverInteractionImplementation, FeatureHoverInteraction> {

    constructor(config)  {
        super(config);
    }

    protected bindToInteractionState_() {
        super.bindToInteractionState_();
        this.subscriptionTracker_.addSubscription(reaction(
            () => this.interaction_.active.value,
            (active) => {
                if (!active) {
                    this.interaction_.selectionManager.setHovered(undefined);
                }
            }
        ));
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            onFeatureHover: (hovered: IFeature<FeatureData> | undefined) => {
                if (hovered?.data) {
                    this.interaction_.selectionManager.setHovered(hovered?.data.model);
                } else {
                    this.interaction_.selectionManager.setHovered(undefined);
                }
            }
        };
    }
}

interactionControllersFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new FeatureHoverInteractionController(config);
});
