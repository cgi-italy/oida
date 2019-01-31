import { types, IAnyModelType, Instance,  IReferenceType, IMaybe } from 'mobx-state-tree';

import { SelectionMode } from  '@oida/core';

export const hasSelectableItems = <T extends IAnyModelType>(
    itemsType: T,
    options: {
        idGetter?: (item: Instance<T>) => string,
        referenceType?: IMaybe<IReferenceType<T>>
    } = {}
) => {

    let {idGetter = (item) => item.id, referenceType = types.safeReference(itemsType)} = options;

    return types.model({
        selectedItems: types.array(referenceType)
    }).actions((self) => {

        const getItemIndex = (item) => {
            return self.selectedItems.indexOf(item);
        };

        const addItem = (item) => {
            self.selectedItems.push(idGetter(item));
        };

        const removeItem = (item) => {
            self.selectedItems.remove(idGetter(item));
        };

        return {
            modifySelection: (item, mode: SelectionMode) => {

                if (mode === SelectionMode.Replace) {
                    self.selectedItems.clear();
                }
                if (item) {
                    if (mode === SelectionMode.Replace) {
                        addItem(item);
                    } else if (mode === SelectionMode.Add) {
                        if (getItemIndex(item) === -1) {
                            addItem(item);
                        }
                    } else if (mode === SelectionMode.Remove) {
                        removeItem(item);
                    } else if (mode === SelectionMode.Toggle) {
                        let idx = getItemIndex(item);
                        if (idx !== -1) {
                            self.selectedItems.splice(idx, 1);
                        } else {
                            addItem(item);
                        }
                    }
                }
            },
            beforeDestroy: () => {
                self.selectedItems.clear();
            }
        };
    });
};

export type IHasSelectableItems = Instance<ReturnType<typeof hasSelectableItems>>;
