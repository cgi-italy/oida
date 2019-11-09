import { types, IAnyModelType, Instance,  IReferenceType, IMaybe } from 'mobx-state-tree';

import { SelectionMode } from  '@oida/core';

export const hasSelectableItems = <T extends IAnyModelType>(
    itemsType: T,
    referenceType?: IReferenceType<T>
) => {

    let refType = referenceType || types.safeReference(itemsType, {acceptsUndefined: false});

    return types.model({
        selectedItems: types.array(refType)
    }).actions((self) => {

        const getItemIndex = (item) => {
            return self.selectedItems.indexOf(item);
        };

        const addItem = (item) => {
            self.selectedItems.push(item);
        };

        const removeItem = (item) => {
            self.selectedItems.remove(item);
        };

        return {
            modifySelection: (item, mode: SelectionMode = SelectionMode.Replace) => {

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
