import { types, Instance } from 'mobx-state-tree';

import { DynamicUnion } from '../mst/dynamic-union';
import { MapEntityType } from '../map/map-entity';
import { hasOpacity } from '../mixins';

const LayerBase = types.compose(
    types.model({
        name: types.optional(types.string, ''),
    }),
    hasOpacity
);

const MapLayerBase = MapEntityType.addType('mapLayer', LayerBase);

export const LayerType = DynamicUnion<'layerType', typeof MapLayerBase>('layerType', (layerModel) => {
    return MapEntityType.addType('mapLayer', types.compose(layerModel.name,
        LayerBase,
        layerModel
    ));
});

export type IMapLayer = Instance<typeof MapLayerBase>;
