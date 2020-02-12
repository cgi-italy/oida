import { types, Instance } from 'mobx-state-tree';

import { TILE_LAYER_ID } from '@oida/core';

import { MapLayer } from './map-layer';

const TileLayerDecl = MapLayer.addModel(
    types.model(TILE_LAYER_ID, {
        source: types.frozen(),
        sourceRevision: types.optional(types.number, 0)
    }).actions((self) => {
        return {
            setSource: (source) => {
                self.source = source;
                self.sourceRevision = 0;
            },
            forceRefresh: () => {
                self.sourceRevision++;
            }
        };
    })
);

type TileLayerType = typeof TileLayerDecl;
export interface TileLayerInterface extends TileLayerType {}
export const TileLayer: TileLayerInterface = TileLayerDecl;
export interface ITileLayer extends Instance<TileLayerInterface> {}

