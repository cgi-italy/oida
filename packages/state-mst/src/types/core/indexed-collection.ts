import { resolveIdentifier, IMSTArray, IAnyType } from 'mobx-state-tree';

import { Collection, ICollection } from './collection';

function defaultIdentifierResolver(id: string, collection: ICollection) {
    return resolveIdentifier(collection.getItemType(), collection.items, id);
}

export const IndexedCollection = <T extends IAnyType>(itemsType: T, identifierResolver = defaultIdentifierResolver) => {

    return Collection(itemsType).actions((self) => {
        return {
            itemWithId: (id: string) => {
                return identifierResolver(id, self);
            },
        };
    });
};

