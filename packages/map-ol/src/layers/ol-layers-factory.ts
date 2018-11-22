import { createDynamicFactory } from '@oida/core';
import { OLMapLayer } from './ol-map-layer';

export const olLayersFactory = createDynamicFactory<OLMapLayer>('ol-layers');
