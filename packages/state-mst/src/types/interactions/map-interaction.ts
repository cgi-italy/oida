import { types, Instance } from 'mobx-state-tree';

import { TaggedUnion } from '../mst/tagged-union';
import { isActivable } from '../mixins';

const MapInteractionBase = types.compose(
    'MapInteraction',
    types.model({
        id: types.identifier
    }),
    isActivable,
);

export const MapInteractionType = TaggedUnion('mapInteractionType', MapInteractionBase);

export type IMapInteraction = Instance<typeof MapInteractionType>;
