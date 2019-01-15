import { types, Instance } from 'mobx-state-tree';

import { GROUP_LAYER_ID } from '@oida/core';

import { LayerType } from './map-layer';
import { MapEntityCollectionFactory } from '../map/map-entity-collection';

export const GroupLayer = LayerType.addType(GROUP_LAYER_ID,
    types.model('GroupLayer', {
        children: types.optional(
            MapEntityCollectionFactory(LayerType.getUnion()),
            {}
        )
    })
);

export type IGroupLayer = Instance<typeof GroupLayer>;
