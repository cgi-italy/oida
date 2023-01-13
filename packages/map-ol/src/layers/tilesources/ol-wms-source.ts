import TileWMS from 'ol/source/TileWMS';

import { olTileSourcesFactory } from './ol-tilesources-factory';

import { getTileGridFromConfig, getUrlFromConfig } from './ol-tilesource-utils';

olTileSourcesFactory.register('wms', function (config) {
    const parameters = {};
    // convert all parameters names to uppercase so that
    // openlayers defaults (e.g. STYLES and FORMAT) are correctly
    // overriden
    if (config.parameters) {
        for (const key in config.parameters) {
            parameters[key.toUpperCase()] = config.parameters[key];
        }
    }

    return new TileWMS({
        ...getUrlFromConfig(config),
        params: {
            LAYERS: config.layers,
            ...parameters
        },
        crossOrigin: config.crossOrigin,
        tileGrid: config.tileGrid ? getTileGridFromConfig(config.srs, config.tileGrid) : undefined,
        projection: config.srs,
        wrapX: config.wrapX
    });
});
