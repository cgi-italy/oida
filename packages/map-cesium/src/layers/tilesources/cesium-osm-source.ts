import createOpenStreetMapImageryProvider from 'cesium/Source/Scene/createOpenStreetMapImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

cesiumTileSourcesFactory.register('osm', (config) => {
    return createOpenStreetMapImageryProvider(config);
});
