import { WebMapServiceImageryProvider } from 'cesium';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('wms', (config) => {
    const tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new WebMapServiceImageryProvider({
            url: getUrlFromTemplate(config),
            layers: config.layers,
            parameters: {
                version: '1.3.0',
                format: 'image/png',
                ...config.parameters
            },
            credit: config.credits,
            enablePickFeatures: false,
            tilingScheme: tileGrid.scheme,
            ...tileGrid.config
        });
    }
});
