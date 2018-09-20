import { createDynamicFactory } from '@cgi-eo/map-core';
import { MapLayerController } from './map-layer-controller';

export const layerControllersFactory = createDynamicFactory<MapLayerController>('layer-controller');
