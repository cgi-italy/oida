import ImageryProvider from 'cesium/Source/Scene/ImageryProvider';

import { createDynamicFactory, ITileSourceDefinitions } from '@oidajs/core';

export const cesiumTileSourcesFactory = createDynamicFactory<ImageryProvider, ITileSourceDefinitions>('cesium-tile-sources');
