import { makeObservable, observable, action, IObservableArray } from 'mobx';

import { SelectionMode } from  '@oida/core';

export class DataSelection<T> {
    readonly items: IObservableArray<T>;

    constructor() {
        this.items = observable.array([], {
            deep: false
        });

        makeObservable(this);
    }

    isSelected(item: T) {
        return this.items.indexOf(item) !== -1;
    }

    @action
    modifySelection(item?: T, mode: SelectionMode = SelectionMode.Replace) {
        if (mode === SelectionMode.Replace) {
            this.items.clear();
        }
        if (item) {
            if (mode === SelectionMode.Replace) {
                this.items.push(item);
            } else if (mode === SelectionMode.Add) {
                if (this.items.indexOf(item) === -1) {
                    this.items.push(item);
                }
            } else if (mode === SelectionMode.Remove) {
                this.items.remove(item);
            } else if (mode === SelectionMode.Toggle) {
                const idx = this.items.indexOf(item);
                if (idx !== -1) {
                    this.items.splice(idx, 1);
                } else {
                    this.items.push(item);
                }
            }
        }
    }
}
