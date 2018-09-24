import { types } from 'mobx-state-tree';

import { GROUP_LAYER_ID } from '@cgi-eo/map-core';

import { LayerType } from './map-layer';
import { Collection } from '../core/collection';

export const GroupLayer = LayerType.addType(GROUP_LAYER_ID,
    types.model({
        children: types.optional(Collection(LayerType.getUnion()), {})
    }).named('GroupLayer')
);
