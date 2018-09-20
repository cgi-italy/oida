import { createDynamicFactory } from '@cgi-eo/map-core';
import { OLMapLayer } from './ol-map-layer';

export const olLayersFactory = createDynamicFactory<OLMapLayer>('ol-layers');
