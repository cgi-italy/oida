import { createDynamicFactory, IMapLayerRenderer, IMapLayerRendererConfigDefinitions } from '@oidajs/core';

export const cesiumLayersFactory = createDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>('cesium-layers');
