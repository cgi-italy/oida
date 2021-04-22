import ImageryProvider from 'cesium/Source/Scene/ImageryProvider';

import { createDynamicFactory, ITileSourceDefinitions } from '@oida/core';

export const cesiumTileSourcesFactory = createDynamicFactory<ImageryProvider, ITileSourceDefinitions>('cesium-tile-sources');
