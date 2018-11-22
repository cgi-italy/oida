import { createDynamicFactory } from '@oida/core';
import { CesiumMapLayer } from './cesium-map-layer';

export const cesiumLayersFactory = createDynamicFactory<CesiumMapLayer>('cesium-layers');
