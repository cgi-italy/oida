import { resolveIdentifier, IMSTArray, IAnyType } from 'mobx-state-tree';

import { Collection, ICollection } from './collection';

function defaultIdentifierResolver(id: string, collection: ICollection) {
    return resolveIdentifier(collection.getItemType(), collection.items, id);
}

export const IndexedCollection = (collection: ReturnType<typeof Collection>, identifierResolver = defaultIdentifierResolver) => {

    return collection.actions((self) => {
        return {
            itemWithId: (id: string) => {
                return identifierResolver(id, self);
            },
        };
    });
};

