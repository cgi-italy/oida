import { makeObservable, observable, action } from 'mobx';

import { Collection, CollectionProps } from './collection';

export type IndexedCollectionProps<T> = CollectionProps<T> & {
    idGetter: (item: T) => string;
};

export class IndexedCollection<T> extends Collection<T> {

    protected idMap_: Record<string, T> = {};
    protected idGetter_: (item: T) => string;

    constructor(props: IndexedCollectionProps<T>) {
        super(props);

        this.idGetter_ = props.idGetter;
        if (props.items) {
            this.indexItems_(props.items);
        }

        makeObservable<IndexedCollection<T>, 'idMap_'>(this, {
            idMap_: observable,
            add: action,
            remove: action,
            clear: action,
            removeItemWithId: action
        });
    }

    add(items: T | T[], idx = -1) {
        super.add(items, idx);
        this.indexItems_(items);
    }

    remove(item: T) {
        super.remove(item);
        delete this.idMap_[this.idGetter_(item)];
    }

    clear() {
        super.clear();
        this.idMap_ = {};
    }

    removeItemWithId(id: string) {
        const item = this.idMap_[id];
        if (item) {
            this.remove(item);
        }
    }

    itemWithId(id: string): T | undefined {
        return this.idMap_[id];
    }

    protected indexItems_(items: T | T[]) {
        if (Array.isArray(items)) {
            items.forEach((item) => {
                this.idMap_[this.idGetter_(item)] = item;
            });
        } else {
            this.idMap_[this.idGetter_(items)] = items;
        }
    }
}
