import { types, detach, flow, resolveIdentifier, IAnyModelType, IType, Instance, SnapshotOrInstance } from 'mobx-state-tree';
import { Collection } from './collection';

export const IndexedCollection = <T extends IAnyModelType>(itemsType: T, key: string) => {

    return Collection(itemsType).actions((self) => {
        return {
            itemWithId: (id) => {
                return resolveIdentifier(itemsType, self.items, id);
            },
        };
    });
};
