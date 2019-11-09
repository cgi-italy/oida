import { types, Instance } from 'mobx-state-tree';

import { GROUP_LAYER_ID } from '@oida/core';

import { MapLayer } from './map-layer';
import { IndexedCollection } from '../core';
import { EntitySafeReference } from '../entity';
import { ReferenceOrType } from '../mst';

export const GroupLayer = MapLayer.addModel(
    types.model(GROUP_LAYER_ID, {
        children: types.optional(
            IndexedCollection(
                ReferenceOrType(MapLayer.Type, EntitySafeReference(MapLayer.Type)),
                undefined,
                'childLayers'
            ), {}
        )
    })
);

export type IGroupLayer = Instance<typeof GroupLayer>;
