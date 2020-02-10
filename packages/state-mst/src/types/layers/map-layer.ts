import { types, Instance } from 'mobx-state-tree';

import { Entity } from '../entity/entity';
import { hasOpacity, hasLoadingState } from '../mixins';

const LayerBase = types.compose(
    'MapLayer',
    types.model({
        name: types.optional(types.string, ''),
        zIndex: types.maybe(types.number),
        extent: types.maybe(types.frozen<number[]>())
    }).volatile(self => ({
        renderer: undefined as any
    })).actions((self) => {
        return {
            setRenderer(renderer) {
                self.renderer = renderer;
            },
            setZIndex: (zIndex: number) => {
                self.zIndex = zIndex;
            },
            setName(name: string) {
                self.name = name;
            },
            setExtent(extent: number[] | undefined) {
                self.extent = extent;
            }
        };
    }),
    hasOpacity,
    hasLoadingState
);

export const MapLayer = Entity.addUnion('layerType', LayerBase);

type MapLayerType = typeof MapLayer.Type;
export interface MapLayerInterface extends MapLayerType {}
export const MapLayerType: MapLayerInterface = MapLayer.Type;
export interface IMapLayer extends Instance<MapLayerInterface> {}
