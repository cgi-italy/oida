import { IAnyType, Instance } from 'mobx-state-tree';

import { Collection, ICollection } from './collection';

function defaultIdentifierResolver(id: string, collection: ICollection) {
    return collection.items.find((item) => {
        return item.id === id;
    });
}

export const IndexedCollection = <T extends IAnyType>(itemsType: T, identifierResolver = defaultIdentifierResolver, name?: string) => {

    return Collection(itemsType, name).actions((self) => {
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

