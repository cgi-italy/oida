import React from 'react';

import { IsSelectable, IsHoverable } from '@oida/state-mobx';
import { AsyncImage, DataCollectionItemProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

export type EntityListItemProps<T extends IsSelectable & IsHoverable> = {
    entity: T;
};

export const useEntityListItem = <T extends IsSelectable & IsHoverable>({entity}: EntityListItemProps<T>) => {
    return useSelector(() => {
        return {
            hovered: entity.hovered.value,
            selected: entity.selected.value,
        } as DataCollectionItemProps<T>;
    }, [entity]);
};
