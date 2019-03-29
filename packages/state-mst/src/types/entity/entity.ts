import { types, Instance, getType, getParent, typecheck, resolveIdentifier, getRoot } from 'mobx-state-tree';

import { TaggedUnion } from '../mst/tagged-union';
import { hasVisibility, isSelectable, isHoverable } from '../mixins';


const EntityBase = types.compose(
    types.model({
        id: types.identifier,
    }),
    hasVisibility,
    isSelectable,
    isHoverable
).preProcessSnapshot((snapshot: any) => {
    if (snapshot && typeof snapshot.id === 'number') {
        return {
            ...snapshot,
            id: snapshot.id.toString()
        };
    } else {
        return snapshot;
    }
});


export const Entity = TaggedUnion('entityType', EntityBase);

export type IEntity = Instance<typeof Entity>;
