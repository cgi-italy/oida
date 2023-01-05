import { OpenStreetMapImageryProvider } from 'cesium';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

cesiumTileSourcesFactory.register('osm', (config) => {
    return new OpenStreetMapImageryProvider(config);
});
