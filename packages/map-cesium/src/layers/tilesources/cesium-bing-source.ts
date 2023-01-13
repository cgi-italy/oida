import { BingMapsImageryProvider, BingMapsStyle } from 'cesium';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

cesiumTileSourcesFactory.register('bing', (config) => {
    let mapStyle = BingMapsStyle.AERIAL;

    for (const key in BingMapsStyle) {
        if (config.imagerySet === BingMapsStyle[key]) {
            mapStyle = BingMapsStyle[key];
            break;
        }
    }
    return new BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: config.key,
        mapStyle: mapStyle
    });
});
