import { GROUP_LAYER_ID, TILE_LAYER_ID, FEATURE_LAYER_ID, VERTICAL_PROFILE_LAYER_ID, VOLUME_LAYER_ID } from '@oidajs/core';

import { cesiumLayersFactory } from './cesium-layers-factory';
import { CesiumGroupLayer } from './cesium-group-layer';
import { CesiumTileLayer } from './cesium-tile-layer';
import { createCesiumFeatureLayer, CesiumEntityFeatureLayer, CesiumPrimitiveFeatureLayer } from './cesium-feature-layer';
import { CesiumVerticalProfileLayer } from './cesium-vertical-profile-layer';
import { CesiumVolumeLayer } from './volume';

cesiumLayersFactory.register(GROUP_LAYER_ID, (config) => {
    return new CesiumGroupLayer(config);
});

cesiumLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new CesiumTileLayer(config);
});

cesiumLayersFactory.register(FEATURE_LAYER_ID, (config) => {
    return createCesiumFeatureLayer(config);
});

cesiumLayersFactory.register(VERTICAL_PROFILE_LAYER_ID, (config) => {
    return new CesiumVerticalProfileLayer(config);
});

cesiumLayersFactory.register(VOLUME_LAYER_ID, (config) => {
    return new CesiumVolumeLayer(config);
});

export * from './cesium-map-layer';
export { cesiumLayersFactory, CesiumGroupLayer, CesiumTileLayer, CesiumEntityFeatureLayer, CesiumPrimitiveFeatureLayer };
export * from './tilesources';
export * from './volume';
