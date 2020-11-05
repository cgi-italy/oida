import { IObservableArray } from 'mobx';

import { SelectionMode } from '@oida/core';
import { Entity, SelectionManager } from '@oida/state-mobx';
import { DataCollectionItemAction } from '@oida/ui-react-core';

import { useEntityListItem } from './use-entity-list-item';
import { useSelector } from './use-selector';


export type EntityCollectionListProps<T extends Entity> = {
    items?: IObservableArray<T>;
    actions?: DataCollectionItemAction<T>[];
    iconGetter?: (entity: T) => string | Promise<string>;
    selectionManager?: SelectionManager;
};


export const useEntityCollectionList = <T extends Entity>(props: EntityCollectionListProps<T>) => {

    const { items, actions, iconGetter, selectionManager } = props;

    let hoveredItem: T | undefined, selectedItem: T | undefined;

    return useSelector(() => {
        if (!items) {
            return;
        }
        return {
            data: items.slice(),
            keyGetter: (entity: T) => entity.id,
            itemSelector: (entity: T) => {
                const itemActions = actions
                    ? actions.filter((action) => action.condition ? action.condition(entity) : true)
                    : undefined;

                return {
                    ...useEntityListItem({entity, iconGetter}),
                    actions: itemActions
                };
            },
            onHoverAction: (item: T, hovered: boolean) => {
                if (selectionManager) {
                    selectionManager.setHovered(hovered ? item : undefined);
                } else {
                    if (hoveredItem) {
                        hoveredItem.hovered.setValue(false);
                    }
                    hoveredItem = hovered ? item : undefined;
                    if (hoveredItem) {
                        hoveredItem.hovered.setValue(true);
                    }
                }
            },
            onSelectAction: (item: T, mode: SelectionMode) => {
                if (selectionManager) {
                    selectionManager.selection.modifySelection(item, mode);
                } else {
                    if (selectedItem) {
                        selectedItem.selected.setValue(false);
                    }
                    selectedItem = item;
                    if (selectedItem) {
                        selectedItem.selected.setValue(true);
                    }
                }
            }
        };
    }, [items]);
};
