import { types } from 'mobx-state-tree';

import { DynamicUnion } from '../mobx/dynamic-union';
import { MapEntityType } from '../map-entity/map-entity';
import { hasOpacity } from '../../behaviours';

const LayerBase = types.compose(
    types.model({
        name: types.optional(types.string, ''),
    }),
    hasOpacity
);

export const LayerType = DynamicUnion('layer', (layerModel) => {
    return MapEntityType.addType('layer', types.compose(
        LayerBase,
        layerModel
    ));
});
