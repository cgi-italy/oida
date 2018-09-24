import { types } from 'mobx-state-tree';

import { TILE_LAYER_ID } from '@cgi-eo/map-core';

import { LayerType } from './map-layer';

export const TileLayer = LayerType.addType(
    TILE_LAYER_ID,
    types.model({
        source: types.frozen()
    }).actions((self) => {
        return {
            setSource: (source) => {
                self.source = {
                    ...self.source,
                    ...source
                };
            }
        };
    }).named('TileLayer')
);
