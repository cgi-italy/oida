import { IObservableArray } from 'mobx';

import { SelectionMode } from '@oida/core';
import { Entity, SelectionManager, IsEntity } from '@oida/state-mobx';
import { DataCollectionItemAction } from '@oida/ui-react-core';

import { useEntityListItem } from './use-entity-list-item';
import { useSelector } from './use-selector';


export type EntityCollectionListProps<T extends IsEntity> = {
    items?: IObservableArray<T>;
    actions?: DataCollectionItemAction<T>[];
    selectionManager?: SelectionManager;
};


export const useEntityCollectionList = <T extends IsEntity>(props: EntityCollectionListProps<T>) => {

    const { items, actions, selectionManager } = props;

    let hoveredItem: T | undefined, selectedItem: T | undefined;

    return useSelector(() => {
        if (!items) {
            return;
        }
        return {
            data: items.slice(),
            keyGetter: (entity: T) => entity.id.toString(),
            itemSelector: (entity: T) => {
                const itemActions = actions
                    ? actions.filter((action) => action.condition ? action.condition(entity) : true)
                    : undefined;

                return {
                    ...useEntityListItem({entity}),
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
