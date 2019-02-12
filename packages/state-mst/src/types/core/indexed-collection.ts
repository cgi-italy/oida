import { resolveIdentifier, IMSTArray, IAnyType, Instance } from 'mobx-state-tree';

import { Collection, ICollection } from './collection';

function defaultIdentifierResolver(id: string, collection: ICollection) {
    return resolveIdentifier(collection.getItemType(), collection.items, id);
}

export const IndexedCollection = <T extends IAnyType>(itemsType: T, identifierResolver = defaultIdentifierResolver) => {

    return Collection(itemsType).actions((self) => {
        return {
            itemWithId: (id: string) : Instance<T> => {
                return identifierResolver(id, self);
            }
        };
    }).actions((self) => {
        return {
            removeItemWithId: (id: string) => {
                let item = self.itemWithId(id);
                if (item) {
                    self.remove(item);
                }
            }
        };
    });
};

