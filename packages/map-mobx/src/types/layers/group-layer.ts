import { types, Instance } from 'mobx-state-tree';

import { GROUP_LAYER_ID } from '@cgi-eo/map-core';

import { LayerType } from './map-layer';
import { Collection } from '../core/collection';

export const GroupLayer = LayerType.addType(GROUP_LAYER_ID,
    types.model('GroupLayer', {
        children: types.optional(Collection(LayerType.getUnion()), {})
    })
);

export type IGroupLayer = Instance<typeof GroupLayer>;
