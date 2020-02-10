import { types, Instance } from 'mobx-state-tree';

import { FEATURE_SELECT_INTERACTION_ID } from '@oida/core';

import { MapInteraction } from './map-interaction';
import { ReferenceOrType } from '../mst/reference-or-type';
import { EntitySelection } from '../entity/entity-selection';

const FeatureSelectInteractionDecl = MapInteraction.addModel(types.model(
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

type FeatureSelectInteractionType = typeof FeatureSelectInteractionDecl;
export interface FeatureSelectInteractionInterface extends FeatureSelectInteractionType {}
export const FeatureSelectInteraction: FeatureSelectInteractionInterface = FeatureSelectInteractionDecl;
export interface IFeatureSelectInteraction extends Instance<FeatureSelectInteractionInterface> {}

