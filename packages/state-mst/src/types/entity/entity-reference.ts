import { types, resolveIdentifier, getRoot, getType, getParent, typecheck, IAnyStateTreeNode } from 'mobx-state-tree';

import { Entity, IEntity } from './entity';
import {
    getEntityCollectionType,
    IEntityCollection
} from './entity-collection';


export function createEntityReference<T extends IEntity>(entity: T) {
    let id = `${entity.id}.${getType(entity).name}`;
    try {
        let collection = getParent(getParent(entity)) as IEntityCollection;
        typecheck(getEntityCollectionType(), collection);
        return `${id}.${collection.id}`;
    } catch (e) {
        return id;
    }
}

export const resolveEntityReference = (reference: string, parent: IAnyStateTreeNode) => {
    let [id, type, collectionId] = reference.split('.');
    if (collectionId) {
        let collection = resolveIdentifier(getEntityCollectionType(), getRoot(parent), collectionId);
        return resolveIdentifier(Entity.getSpecificType(type), collection.items, id);
    } else {
        return resolveIdentifier(Entity.getSpecificType(type), getRoot(parent), id);
    }
};

export const EntityReference = types.safeReference(Entity, {
    get(reference: string, parent) {
        return resolveEntityReference(reference, parent);
    },
    set(entity, parent) {
        return createEntityReference(entity);
    }
});
