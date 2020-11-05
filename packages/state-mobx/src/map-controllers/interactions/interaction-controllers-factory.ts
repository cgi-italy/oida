import { createDynamicFactory } from '@oida/core';
import { MapInteractionController } from './map-interaction-controller';

export const interactionControllersFactory = createDynamicFactory<MapInteractionController>('interaction-controller');
