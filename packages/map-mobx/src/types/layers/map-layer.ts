import { types, Instance } from 'mobx-state-tree';

import { DynamicUnion } from '../mobx/dynamic-union';
import { MapEntityType } from '../map-entity/map-entity';
import { hasOpacity } from '../../behaviours';

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
