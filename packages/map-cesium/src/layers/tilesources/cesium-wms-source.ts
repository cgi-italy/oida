import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('wms', (config) => {
    let tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new WebMapServiceImageryProvider({
            url: getUrlFromTemplate(config),
            layers: config.layers,
            format: config.format,
            parameters: config.parameters,
            enablePickFeatures: false,
            tilingScheme: tileGrid.scheme,
            ...tileGrid.config
        });
    }
});
