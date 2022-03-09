import { createDynamicFactory, IMapLayerRenderer, IMapLayerRendererConfigDefinitions } from '@oidajs/core';

export const olLayersFactory = createDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>('ol-layers');
