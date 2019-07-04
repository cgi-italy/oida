import React from 'react';

import { useObserver } from 'mobx-react-lite';

import { IEntity } from '@oida/state-mst';
import { DataCollectionItemProps } from '@oida/ui-react-core';

export type EntityListItemProps<T extends IEntity> = {
    entity: T;
};

export const useEntityListItem = <T extends IEntity>({entity}: EntityListItemProps<T>) => {
    return useObserver(() => {
        return {
            hovered: entity.hovered,
            selected: entity.selected,
        } as DataCollectionItemProps<T>;
    });
};
