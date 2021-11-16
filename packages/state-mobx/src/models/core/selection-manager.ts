import { observe, observable, makeObservable, action } from 'mobx';

import { DataSelection } from './data-selection';
import { IsHoverable, IsSelectable } from '../mixins';

export type SelectableItem = IsSelectable & IsHoverable;

export class SelectionManager<T extends SelectableItem = SelectableItem> {
    selection: DataSelection<T>;
    readonly hovered = observable<T>([]);

    constructor() {
        this.selection = new DataSelection();

        makeObservable(this);

        this.afterInit_();
    }

    @action
    setHovered(items: T | T[] | undefined) {
        if (this.hovered.length === 1 && items === this.hovered[0]) {
            return;
        }
        this.hovered.forEach((item) => item.hovered.setValue(false));

        if (Array.isArray(items)) {
            this.hovered.replace(items);
        } else if (items) {
            this.hovered.replace([items]);
        } else {
            this.hovered.clear();
        }

        this.hovered.forEach((item) => item.hovered.setValue(true));
    }

    protected afterInit_() {
        observe(this.selection.items, (change) => {
            if (change.type === 'splice') {
                change.added.forEach(item => item.selected.setValue(true));
                change.removed.forEach(item => item.selected.setValue(false));
            } else if (change.type === 'update') {
                change.oldValue.selected.setValue(false);
                change.newValue.selected.setValue(true);
            }
        });
    }
}
