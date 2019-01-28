import { types, Instance } from 'mobx-state-tree';

import { Entity } from '../entity/entity';
import { hasOpacity } from '../mixins';

const LayerBase = types.compose(
    'mapLayer',
    types.model({
        name: types.optional(types.string, ''),
    }).volatile(self => ({
        renderer: null
    })).actions((self) => {
        return {
            setRenderer(renderer) {
                self.renderer = renderer;
            }
        };
    }),
    hasOpacity
);

export const MapLayer = Entity.addUnion('layerType', LayerBase);

export type IMapLayer = Instance<typeof MapLayer>;
