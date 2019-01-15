import { types, detach, flow, resolveIdentifier, IAnyType, SnapshotOrInstance, Instance } from 'mobx-state-tree';

function isArray<T>(type: T | T[]): type is T[] {
    return Array.isArray(type);
}

export const Collection = <T extends IAnyType>(itemsType: T) => {
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
                self.items.remove(item);
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
            itemAt: (index) => {
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
    }).named(`${itemsType.name}Collection`);
};

export type ICollection = Instance<ReturnType<typeof Collection>>;
