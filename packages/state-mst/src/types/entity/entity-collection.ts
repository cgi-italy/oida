import { types, IAnyModelType, Instance, getType } from 'mobx-state-tree';

import { TaggedUnion } from '../mst/tagged-union';
import { Entity, IEntity } from './entity';

import { IndexedCollection } from '../core';

let nextCollectionId = 1;

const EntityCollectionBase = types.model({
    id: types.optional(types.identifier, () => `entityCollection${nextCollectionId++}`)
});

export const EntityCollection = TaggedUnion('entityCollectionType', EntityCollectionBase);


export function EntityCollectionFactory<T extends typeof Entity>(entityType: T) {
    return IndexedCollection(entityType);
}

export const createEntityCollectionType = <T extends typeof Entity>(type: T, collectionFactory = EntityCollectionFactory) => {
    let collectionTypeName = `${type.name}Collection`;
    return EntityCollection.addModel(collectionFactory(type).named(collectionTypeName));
};

//only for typings
const EntityCollectionType = types.compose(EntityCollectionBase, IndexedCollection(Entity));

export const getEntityCollectionType = () => {
    return <unknown>EntityCollection as typeof EntityCollectionType;
};


export type IEntityCollection = Instance<typeof EntityCollectionType>;
