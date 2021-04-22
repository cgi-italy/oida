import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('xyz', (config) => {
    let tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new UrlTemplateImageryProvider({
            url: getUrlFromTemplate(config),
            tilingScheme: tileGrid.scheme,
            ...tileGrid.config
        });
    }
});
