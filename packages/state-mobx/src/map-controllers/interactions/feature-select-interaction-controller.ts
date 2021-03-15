import { autorun } from 'mobx';

import { MapInteractionController } from './map-interaction-controller';

import { IFeatureSelectInteractionImplementation, FEATURE_SELECT_INTERACTION_ID, SelectionMode, IFeature } from '@oida/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { FeatureSelectInteraction } from '../../models/map/interactions/feature-select-interaction';
import { FeatureData } from '../layers/feature-layer-controller';

export class FeatureSelectInteractionController extends
    MapInteractionController<IFeatureSelectInteractionImplementation, FeatureSelectInteraction> {

    constructor(config)  {
        super(config);
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            onFeatureSelect: (selected: {
                feature: IFeature<FeatureData> | undefined,
                mode: SelectionMode
            }) => {
                if (selected.feature) {
                    this.interaction_.selectionManager.selection.modifySelection(selected.feature.data.model, selected.mode);
                } else {
                    this.interaction_.selectionManager.selection.modifySelection(undefined, selected.mode);
                }
            }
        };
    }

    protected bindToInteractionState_() {
        super.bindToInteractionState_();
        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.interactionImpl_!.setMultiple(this.interaction_.config.value.multiple);
        }));
    }
}

interactionControllersFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new FeatureSelectInteractionController(config);
});
