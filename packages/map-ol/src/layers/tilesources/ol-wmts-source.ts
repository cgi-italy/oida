import WMTSSource from 'ol/source/WMTS';

import { getTileGridFromConfig, getUrlFromConfig } from './ol-tilesource-utils';

import { olTileSourcesFactory } from './ol-tilesources-factory';

olTileSourcesFactory.register('wmts', function(config) {

    return new WMTSSource({
        ...getUrlFromConfig(config),
        layer: config.layer,
        style: config.style,
        format: config.format,
        requestEncoding: config.requestEncoding,
        dimensions: config.dimensions,
        matrixSet: config.matrixSet,
        tileGrid: getTileGridFromConfig(config.srs, {
            ...config.tileGrid,
            isWMTS: true
        }),
        projection: config.srs,
        wrapX: config.wrapX
    });
});
