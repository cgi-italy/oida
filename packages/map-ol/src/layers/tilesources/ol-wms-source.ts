import TileWMS from 'ol/source/TileWMS';

import { olTileSourcesFactory } from './ol-tilesources-factory';

import { getTileGridFromConfig, getUrlFromConfig } from './ol-tilesource-utils';

olTileSourcesFactory.register('wms', function(config) {

    return new TileWMS({
        ...getUrlFromConfig(config),
        params: {
          LAYERS: config.layers,
          ...config.parameters
        },
        crossOrigin: config.crossOrigin,
        tileGrid: config.tileGrid ? getTileGridFromConfig(config.srs, config.tileGrid) : null,
        projection: config.srs,
        wrapX: config.wrapX
    });
});
