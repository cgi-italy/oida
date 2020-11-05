import React from 'react';

import { IsSelectable, IsHoverable } from '@oida/state-mobx';
import { AsyncImage, DataCollectionItemProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

export type EntityListItemProps<T extends IsSelectable & IsHoverable> = {
    entity: T;
    iconGetter?: (entity: T) => string | Promise<string>;
};

export const useEntityListItem = <T extends IsSelectable & IsHoverable>({entity, iconGetter}: EntityListItemProps<T>) => {
    return useSelector(() => {

        let iconSrc = iconGetter ? iconGetter(entity) : undefined;
        let icon = iconSrc ? (<AsyncImage imageUrl={iconSrc}></AsyncImage>) : undefined;

        return {
            hovered: entity.hovered.value,
            selected: entity.selected.value,
            icon
        } as DataCollectionItemProps<T>;
    });
};
