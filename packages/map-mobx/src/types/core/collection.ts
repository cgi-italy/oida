import { types, detach, flow, resolveIdentifier } from 'mobx-state-tree';

export const Collection = (itemsType) => {
    return types.model({
        items: types.optional(types.array(itemsType), [])
    }).actions((self) => {
        return {
            add: (items, idx = -1) => {
                if (!Array.isArray(items)) {
                    items = [items];
                }

                if (idx < 0 || idx > self.items.length) {
                    idx = self.items.length;
                }

                self.items.splice(idx, 0, ...items);
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
            clear: (item) => {
                self.items.clear();
            }
        };
    }).views((self) => {

        let pathRegex = new RegExp(`^/items/([0-9]*)`);

        return {
            itemAt: (index) => {
                return self.items[index];
            },
            itemWithId: (id) => {
                return resolveIdentifier(itemsType, self.items, id);
            },
            getItemFromPath: (path) => {
                let matches = path.match(pathRegex);
                if (!matches || matches.length < 2) {
                    return null;
                }
                return self.items[parseInt(matches[1])];
            }
        };
    }).named(`${itemsType.name}Collection`);
};
