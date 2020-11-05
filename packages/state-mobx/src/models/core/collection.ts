import { observable, action, makeObservable } from 'mobx';

export type CollectionProps<T> = {
    items?: T[]
};

export class Collection<T> {
    readonly items = observable<T>([]);

    constructor(props?: CollectionProps<T>) {
        this.items = observable<T>(props?.items || [], {
            deep: false
        });
        makeObservable(this);
    }

    itemAt(idx: number) {
        return this.items[idx];
    }

    @action
    add(items: T | T[], idx = -1) {
        if (idx < 0 || idx > this.items.length) {
            idx = this.items.length;
        }

        if (Array.isArray(items)) {
            this.items.splice(idx, 0, ...items);
            this.items.slice(idx, idx + items.length);
        } else {
            this.items.splice(idx, 0, items);
        }
    }

    @action
    update(idx: number, item: T) {
        if (idx < this.items.length) {
            this.items[idx] = item;
        } else {
            throw new Error('Collection.update: index out of range');
        }
    }

    @action
    remove(item: T) {
        this.items.remove(item);
    }

    @action
    move(item: T, position: number) {
        let currentPosition = this.items.indexOf(item);
        if (currentPosition !== -1) {
            this.items.splice(currentPosition, 1);
            this.items.splice(position, 0, item);
        }
    }

    @action
    sort(compareFn: ((a: T, b: T) => number)) {
        this.items.replace(this.items.sort(compareFn));
    }

    @action
    clear() {
        this.items.clear();
    }
}
