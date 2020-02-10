import { types, Instance, IModelType } from 'mobx-state-tree';

import { TaggedUnion } from '../mst/tagged-union';
import { Entity, EntityType } from './entity';

import { IndexedCollection } from '../core';
import { ExtractPropsFromModel, ExtractOthersFromModel } from '../../utils';

let nextCollectionId = 1;

const EntityCollectionBase = types.model({
    id: types.optional(types.identifier, () => `entityCollection${nextCollectionId++}`)
});

export const EntityCollection = TaggedUnion('entityCollectionType', EntityCollectionBase);

type EntityProps = ExtractPropsFromModel<typeof EntityType>;
type EntityOthers = ExtractOthersFromModel<typeof EntityType>;

export function EntityCollectionFactory<PROPS extends EntityProps, OTHERS extends EntityOthers>(entityType: IModelType<PROPS, OTHERS>) {
    return IndexedCollection(entityType);
}

export const createEntityCollectionType = <PROPS extends EntityProps, OTHERS extends EntityOthers>
(type: IModelType<PROPS, OTHERS>, collectionFactory = EntityCollectionFactory) => {
    let collectionTypeName = `${type.name}Collection`;
    return EntityCollection.addModel(collectionFactory(type).named(collectionTypeName));
};

export const getEntityCollectionType = () => {
    return <unknown>EntityCollection.Type as EntityCollectionType<typeof EntityType>;
};

class EntityCollectionTypeHelper<PROPS extends EntityProps, OTHERS extends EntityOthers> {
    Return = createEntityCollectionType<PROPS, OTHERS>({} as IModelType<PROPS, OTHERS>);
}

type EntityCollectionType<T extends IModelType<any, any>> =
EntityCollectionTypeHelper<ExtractPropsFromModel<T>, ExtractOthersFromModel<T>>['Return'];

export type IEntityCollection<T extends IModelType<any, any>> =
Instance<EntityCollectionType<T>>;
