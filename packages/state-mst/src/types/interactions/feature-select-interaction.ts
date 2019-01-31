import { types, Instance } from 'mobx-state-tree';

import { FEATURE_SELECT_INTERACTION_ID } from '@oida/core';

import { MapInteractionType } from './map-interaction';
import { ReferenceOrType } from '../mst/reference-or-type';
import { EntitySelection } from '../entity/entity-selection';

export const FeatureSelectInteraction = MapInteractionType.addModel(types.model(
    FEATURE_SELECT_INTERACTION_ID,
    {
        selection: ReferenceOrType(EntitySelection),
        multiple: types.optional(types.boolean, true)
    }
).actions((self) => {
    return {
        setSelectionManager: (selectionManager) => {
            self.selection = selectionManager;
        },
        setMultiple: (multiple: boolean) => {
            self.multiple = multiple;
        }
    };
}));

export type IFeatureSelectInteraction = Instance<typeof FeatureSelectInteraction>;
