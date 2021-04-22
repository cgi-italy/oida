import { createDynamicFactory, IMapLayerRenderer, IMapLayerRendererConfigDefinitions } from '@oida/core';

export const cesiumLayersFactory = createDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>('cesium-layers');
