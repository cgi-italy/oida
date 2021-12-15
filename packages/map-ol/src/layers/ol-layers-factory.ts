import { createDynamicFactory, IMapLayerRenderer, IMapLayerRendererConfigDefinitions, MapLayerRendererConfig } from '@oidajs/core';

export const olLayersFactory = createDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>('ol-layers');
