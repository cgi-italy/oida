import { types, detach, flow, getSnapshot, IAnyType, SnapshotOrInstance, Instance } from 'mobx-state-tree';

function isArray<T>(type: T | T[]): type is T[] {
    return Array.isArray(type);
}

export const Collection = <T extends IAnyType>(itemsType: T, name?: string) => {
    return types.model({
        items: types.optional(types.array(itemsType), [])
    }).actions((self) => {
        return {
            add: (items: SnapshotOrInstance<T>[] | SnapshotOrInstance<T>, idx = -1) => {

                if (idx < 0 || idx > self.items.length) {
                    idx = self.items.length;
                }

                if (isArray(items)) {
                    self.items.splice(idx, 0, ...<any>items);
                    return self.items.slice(idx, idx + items.length);
                } else {
                    self.items.splice(idx, 0, <any>items);
                    return self.items[idx];
                }
            },
            asyncAdd: flow(function* addBatch(items, idx = -1, frameBatchSize = 100) {
                if (!Array.isArray(items)) {
                    items = [items];
                }

                if (idx < 0 || idx > self.items.length) {
                    idx = self.items.length;
                }

                let batchIdx = 0;
                while (batchIdx < items.length) {
                    let toAdd = yield new Promise((resolve, reject) => {
                        requestAnimationFrame(() => {
                            return resolve(items.slice(batchIdx, Math.min(batchIdx + frameBatchSize, items.length)));
                        });
                    });
                    self.items.splice(idx, 0, ...toAdd);
                    batchIdx += frameBatchSize;
                }
            }),
            remove: (item) => {
                if (typeof item === 'string') {
                    let idx = getSnapshot(self.items).indexOf(item);
                    if (idx !== -1) {
                        self.items.splice(idx, 1);
                    }
                } else {
                    self.items.remove(item);
                }
            },
            move: (item, position) => {
                let currentPosition = self.items.indexOf(item);
                detach(self.items[currentPosition]);
                self.items.splice(position, 0, item);
            },
            sort: (compareFn) => {
                self.items = self.items.sort(compareFn);
            },
            clear: () => {
                self.items.clear();
            }
        };
    }).views((self) => {

        let pathRegex = new RegExp(`^/items/([0-9]*)`);

        return {
            itemAt: (index) : Instance<T> => {
                return self.items[index];
            },
            getItemFromPath: (path) => {
                let matches = path.match(pathRegex);
                if (!matches || matches.length < 2) {
                    return null;
                }
                return self.items[parseInt(matches[1])];
            },
            getItemType: () => {
                return itemsType;
            }
        };
    }).named(name || `${itemsType.name}Collection`);
};

class CollectionTypeHelper<T extends IAnyType> {
    Return = Collection<T>({} as T);
}

export type ICollection<T extends IAnyType = IAnyType> = Instance<CollectionTypeHelper<T>['Return']>;
