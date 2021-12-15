import { createDynamicFactory } from '@oidajs/core';
import { MapLayerController } from './map-layer-controller';

export const layerControllersFactory = createDynamicFactory<MapLayerController>('layer-controller');
