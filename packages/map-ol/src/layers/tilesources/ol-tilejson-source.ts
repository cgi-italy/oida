import TileJSON from 'ol/source/TileJSON';

import { TILEJSON_SOURCE_ID } from '@oidajs/core';

import { olTileSourcesFactory } from './ol-tilesources-factory';

olTileSourcesFactory.register(TILEJSON_SOURCE_ID, (config) => {
    return new TileJSON({
        tileJSON: config.tileJsonConfig
    });
});
