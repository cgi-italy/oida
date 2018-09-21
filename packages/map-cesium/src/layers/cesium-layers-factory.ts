import { createDynamicFactory } from '@cgi-eo/map-core';
import { CesiumMapLayer } from './cesium-map-layer';

export const cesiumLayersFactory = createDynamicFactory<CesiumMapLayer>('cesium-layers');
