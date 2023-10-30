import { WebMapTileServiceImageryProvider } from 'cesium';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('wmts', (config) => {
    const tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new WebMapTileServiceImageryProvider({
            url: getUrlFromTemplate(config),
            subdomains: config.subdomains,
            layer: config.layer,
            style: config.style || 'default',
            format: config.format,
            tileMatrixSetID: config.matrixSet,
            tilingScheme: tileGrid.scheme,
            credit: config.credits,
            ...tileGrid.config
        });
    }
});
