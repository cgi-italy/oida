import { types, Instance } from 'mobx-state-tree';

import { TaggedUnion } from '../mst/tagged-union';
import { hasVisibility, isSelectable, isHoverable } from '../mixins';


const EntityBase = types.compose(
    'Entity',
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

type EntityType = typeof Entity.Type;
export interface EntityInterface extends EntityType {}
export const EntityType: EntityInterface = Entity.Type;
export interface IEntity extends Instance<EntityInterface> {}
