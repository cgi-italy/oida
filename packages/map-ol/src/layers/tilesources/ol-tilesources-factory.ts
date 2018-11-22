import TileGrid from 'ol/tilegrid/TileGrid';

import { createDynamicFactory } from '@oida/core';

let factory = createDynamicFactory('ol-tilesources');

export const olTileSourcesFactory = {
    ...factory,
    create: (id, config) => {
        return factory.create(id, {
            ...config,
            tileGrid: config.tileGrid ? new TileGrid(config.tileGrid) : null
        });
    }
};
