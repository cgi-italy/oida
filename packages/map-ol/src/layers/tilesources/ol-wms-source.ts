import TileWMS from 'ol/source/TileWMS';

import { olTileSourcesFactory } from './ol-tilesources-factory';

olTileSourcesFactory.register('wms', function(config) {
    return new TileWMS({
        url: config.url,
        params: {
          LAYERS: config.layers,
          ...config.parameters
        },
        projection: config.srs,
        wrapX: config.wrapX
    });
});
