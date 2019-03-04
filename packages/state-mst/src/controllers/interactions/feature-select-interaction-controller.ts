import { autorun } from 'mobx';

import { MapInteractionController } from './map-interaction-controller';

import { IFeatureSelectInteractionImplementation, FEATURE_SELECT_INTERACTION_ID, SelectionMode } from '@oida/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { IFeatureSelectInteraction } from '../../types/interactions/feature-select-interaction';
import { resolveEntityReference } from '../../types/entity/entity-reference';
import { entityReferenceFromFeatureId } from '../layers/feature-layer-controller';

export class FeatureSelectInteractionController extends
    MapInteractionController<IFeatureSelectInteractionImplementation, IFeatureSelectInteraction> {

    constructor(config)  {
        super(config);
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            onFeatureSelect: (featureId: string, mode: SelectionMode) => {
                let entity = null;
                if (featureId) {
                    entity = resolveEntityReference(entityReferenceFromFeatureId(featureId), this.interaction_);
                }
                this.interaction_.selection.modifySelection(entity, mode);
            }
        };
    }

    protected bindToInteractionState_() {
        super.bindToInteractionState_();
        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.interactionImpl_.setMultiple(this.interaction_.multiple);
        }));
    }
}

interactionControllersFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new FeatureSelectInteractionController(config);
});
