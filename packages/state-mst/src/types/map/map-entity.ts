import { types } from 'mobx-state-tree';

import { DynamicUnion } from '../mst/dynamic-union';
import { hasVisibility, isSelectable, isHoverable } from '../mixins';

const MapEntityBase = types.compose(
    types.model({
        id: types.identifier
    }),
    hasVisibility,
    isSelectable,
    isHoverable
);

export const MapEntityType = DynamicUnion<'mapEntityType', typeof MapEntityBase>
    ('mapEntityType', (entityModel) => {
    return types.compose(
        entityModel.name,
        MapEntityBase,
        entityModel
    );
});

