import { GROUP_LAYER_ID, TILE_LAYER_ID, FEATURE_LAYER_ID } from '@oida/core';

import { cesiumLayersFactory } from './cesium-layers-factory';
import { CesiumGroupLayer } from './cesium-group-layer';
import { CesiumTileLayer } from './cesium-tile-layer';
import { createCesiumFeatureLayer, getPickedFeatureEntity, CesiumEntityFeatureLayer, CesiumPrimitiveFeatureLayer } from './cesium-feature-layer';

cesiumLayersFactory.register(GROUP_LAYER_ID, (config) => {
    return new CesiumGroupLayer(config);
});

cesiumLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new CesiumTileLayer(config);
});

cesiumLayersFactory.register(FEATURE_LAYER_ID, createCesiumFeatureLayer);

export * from './cesium-map-layer';
export {
    cesiumLayersFactory,
    CesiumGroupLayer,
    CesiumTileLayer,
    CesiumEntityFeatureLayer,
    CesiumPrimitiveFeatureLayer,
    getPickedFeatureEntity
};
export * from './tilesources';
