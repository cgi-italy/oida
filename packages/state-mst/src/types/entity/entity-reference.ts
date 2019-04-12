import { types, resolveIdentifier, getRoot, getType, getParent, typecheck, IAnyStateTreeNode, TypeOfValue } from 'mobx-state-tree';

import { Entity, IEntity } from './entity';
import {
    getEntityCollectionType,
    IEntityCollection
} from './entity-collection';

const SEPARATOR = '\\./';

export function createEntityReference<T extends IEntity>(entity: T) {
    let id = `${entity.id}${SEPARATOR}${getType(entity).name}`;
    try {
        let collection = getParent(getParent(entity)) as IEntityCollection<TypeOfValue<T>>;
        typecheck(getEntityCollectionType(), collection);
        return `${id}${SEPARATOR}${collection.id}`;
    } catch (e) {
        return id;
    }
}

export const resolveEntityReference = (reference: string, parent: IAnyStateTreeNode | null) => {

    if (!parent) {
        return undefined;
    }

    let [id, type, collectionId] = reference.split(SEPARATOR);
    if (collectionId) {
        let collection = resolveIdentifier(getEntityCollectionType(), getRoot(parent), collectionId);
        if (collection) {
            return collection.itemWithId(id);
        }
    } else {
        let entityType = Entity.getSpecificType(type);
        if (entityType) {
            return resolveIdentifier(entityType, getRoot(parent), id);
        }
    }
};

export const EntityReference = types.safeReference(Entity.Type, {
    get(reference: string, parent) {
        return resolveEntityReference(reference, parent);
    },
    set(entity, parent) {
        return createEntityReference(entity);
    }
});
