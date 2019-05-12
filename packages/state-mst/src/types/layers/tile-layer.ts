import { types, Instance } from 'mobx-state-tree';

import { TILE_LAYER_ID } from '@oida/core';

import { MapLayer } from './map-layer';

export const TileLayer = MapLayer.addModel(
    types.model(TILE_LAYER_ID, {
        source: types.frozen(),
        extent: types.maybe(types.frozen<number[]>())
    }).actions((self) => {
        return {
            setSource: (source) => {
                self.source = source;
            }
        };
    })
);

export type ITileLayer = Instance<typeof TileLayer>;
