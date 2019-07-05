import React from 'react';

import { useObserver } from 'mobx-react-lite';

import { IEntity } from '@oida/state-mst';
import { AsyncImage, DataCollectionItemProps } from '@oida/ui-react-core';

export type EntityListItemProps<T extends IEntity> = {
    entity: T;
    iconGetter?: (entity: T) => string | Promise<string>;
};

export const useEntityListItem = <T extends IEntity>({entity, iconGetter}: EntityListItemProps<T>) => {
    return useObserver(() => {

        let iconSrc = iconGetter ? iconGetter(entity) : undefined;
        let icon = iconSrc ? (<AsyncImage imageUrl={iconSrc}></AsyncImage>) : undefined;

        return {
            hovered: entity.hovered,
            selected: entity.selected,
            icon
        } as DataCollectionItemProps<T>;
    });
};
