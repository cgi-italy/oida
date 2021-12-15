import { createDynamicFactory } from '@oidajs/core';
import { MapInteractionController } from './map-interaction-controller';

export const interactionControllersFactory = createDynamicFactory<MapInteractionController>('interaction-controller');
