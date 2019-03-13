import XYZSource from 'ol/source/XYZ';

import { olTileSourcesFactory } from './ol-tilesources-factory';
import { getTileGridFromConfig, getUrlFromConfig } from './ol-tilesource-utils';

olTileSourcesFactory.register('xyz', function(config) {
    return new XYZSource({
        ...getUrlFromConfig(config),
        tileGrid: config.tileGrid ? getTileGridFromConfig(config.srs, config.tileGrid) : null,
        projection: config.srs,
        wrapX: config.wrapX
    });
});
