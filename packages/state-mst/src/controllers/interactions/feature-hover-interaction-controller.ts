import { MapInteractionController } from './map-interaction-controller';

import { IFeatureHoverInteractionImplementation, FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { IFeatureHoverInteraction } from '../../types/interactions/feature-hover-interaction';
import { resolveEntityReference } from '../../types/entity/entity-reference';
import { entityReferenceFromFeatureId } from '../layers/feature-layer-controller';

export class FeatureHoverInteractionController extends
    MapInteractionController<IFeatureHoverInteractionImplementation, IFeatureHoverInteraction> {

    constructor(config)  {
        super(config);
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            onFeatureHover: (featureId: string) => {
                let entity = null;
                if (featureId) {
                    entity = resolveEntityReference(entityReferenceFromFeatureId(featureId), this.interaction_);
                }
                this.interaction_.selection!.setHovered(entity);
            }
        };
    }
}

interactionControllersFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new FeatureHoverInteractionController(config);
});
