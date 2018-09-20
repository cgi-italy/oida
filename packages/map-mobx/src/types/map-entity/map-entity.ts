import { types } from 'mobx-state-tree';

import { DynamicUnion } from '../mobx/dynamic-union';
import { hasVisibility, isSelectable, isHoverable } from '../../behaviours';

const MapEntityBase = types.compose(
    types.model({
        id: types.identifier
    }),
    hasVisibility,
    isSelectable,
    isHoverable
);

export const MapEntityType = DynamicUnion('mapEntity', (entityModel) => {
    return types.compose(
        MapEntityBase,
        entityModel
    ).named('MapEntity');
});
