import OpenStreetMapImageryProvider  from 'cesium/Source/Scene/OpenStreetMapImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

cesiumTileSourcesFactory.register('osm', (config) => {
    return new OpenStreetMapImageryProvider(config);
});
