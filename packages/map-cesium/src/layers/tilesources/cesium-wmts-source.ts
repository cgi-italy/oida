import WebMapTileServiceImageryProvider from 'cesium/Source/Scene/WebMapTileServiceImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('wmts', (config) => {
    let tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new WebMapTileServiceImageryProvider({
            url: getUrlFromTemplate(config),
            subdomains: config.subdomains,
            layer: config.layer,
            style: config.style || 'default',
            format: config.format,
            tileMatrixSetID: config.matrixSet,
            tileMatrixLabels: config.tileGrid.matrixIds,
            tilingScheme: tileGrid.scheme,
            ...tileGrid.config
        });
    }
});
