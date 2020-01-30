import React from 'react';

import { TypeOfValue } from 'mobx-state-tree';
import { useObserver } from 'mobx-react';

import { SelectionMode } from '@oida/core';
import { IEntityCollection, IEntity, IEntitySelection } from '@oida/state-mst';
import { AsyncImage, DataCollectionItemAction } from '@oida/ui-react-core';

import { useEntityListItem } from './use-entity-list-item';


export type EntityCollectionListProps<T extends IEntity> = {
    collection?: IEntityCollection<TypeOfValue<T>>;
    actions?: DataCollectionItemAction<T>[];
    iconGetter?: (entity: T) => string | Promise<string>;
    entitySelection?: IEntitySelection;
};


export const useEntityCollectionList = <T extends IEntity>({
    collection,
    actions,
    iconGetter,
    entitySelection
}: EntityCollectionListProps<T>) => {

    let hoveredItem: T | undefined, selectedItem: T | undefined;

    return useObserver(() => {
        if (!collection) {
            return;
        }
        return {
            data: collection.items.slice(),
            keyGetter: (entity: T) => entity.id,
            itemSelector: (entity: T) => {
                return {
                    ...useEntityListItem({entity, iconGetter}),
                    actions
                };
            },
            onHoverAction: (item: T, hovered: boolean) => {
                if (entitySelection) {
                    entitySelection.setHovered(hovered ? item : null);
                } else {
                    if (hoveredItem) {
                        hoveredItem.setHovered(false);
                    }
                    hoveredItem = hovered ? item : undefined;
                    if (hoveredItem) {
                        hoveredItem.setHovered(true);
                    }
                }
            },
            onSelectAction: (item: T, mode: SelectionMode) => {
                if (entitySelection) {
                    entitySelection.modifySelection(item, mode);
                } else {
                    if (selectedItem) {
                        selectedItem.setSelected(false);
                    }
                    selectedItem = item;
                    if (selectedItem) {
                        selectedItem.setSelected(true);
                    }
                }
            }
        };
    });
};
