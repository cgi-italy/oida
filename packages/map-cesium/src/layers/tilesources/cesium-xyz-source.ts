import { UrlTemplateImageryProvider } from 'cesium';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

import { getTileGridFromSRS, getUrlFromTemplate } from './cesium-tilesource-utils';

cesiumTileSourcesFactory.register('xyz', (config) => {
    const tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {
        return new UrlTemplateImageryProvider({
            url: getUrlFromTemplate(config),
            tilingScheme: tileGrid.scheme,
            credit: config.credits,
            ...tileGrid.config
        });
    }
});
