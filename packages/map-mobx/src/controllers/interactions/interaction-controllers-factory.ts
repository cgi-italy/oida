import { createDynamicFactory } from '@cgi-eo/map-core';
import { MapInteractionController } from './map-interaction-controller';

export const interactionControllersFactory = createDynamicFactory<MapInteractionController>('interaction-controller');
