import { types, Instance } from 'mobx-state-tree';

import { FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { MapInteraction } from './map-interaction';
import { ReferenceOrType } from '../mst/reference-or-type';
import { EntitySelection } from '../entity/entity-selection';

export const FeatureHoverInteraction = MapInteraction.addModel(types.model(
    FEATURE_HOVER_INTERACTION_ID,
    {
        selection: ReferenceOrType(EntitySelection)
    }
).actions((self) => {
    return {
        setSelectionManager: (selectionManager) => {
            self.selection = selectionManager;
        }
    };
}));

export type IFeatureHoverInteraction = Instance<typeof FeatureHoverInteraction>;
