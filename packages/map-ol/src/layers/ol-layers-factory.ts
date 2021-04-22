import { createDynamicFactory, IMapLayerRenderer, IMapLayerRendererConfigDefinitions, MapLayerRendererConfig } from '@oida/core';

export const olLayersFactory = createDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>('ol-layers');
