import { types, Instance } from 'mobx-state-tree';

import { DynamicUnion } from '../mobx/dynamic-union';
import { isActivable } from '../../behaviours';

const MapInteractionBase = types.compose(
    types.model({
        id: types.identifier
    }),
    isActivable,
);

export const MapInteractionType = DynamicUnion<'mapInteractionType', typeof MapInteractionBase>
    ('mapInteractionType', (interactionModel) => {
    return types.compose(
        interactionModel.name,
        MapInteractionBase,
        interactionModel
    );
});

export const MapInteraction = MapInteractionType.addType('mapInteraction', types.model({}));
export type IMapInteraction = Instance<typeof MapInteraction>;
