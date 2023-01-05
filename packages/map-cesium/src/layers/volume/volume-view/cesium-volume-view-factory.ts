import { createDynamicFactory } from '@oidajs/core';

import { CesiumVolumeView } from './cesium-volume-view';

export const cesiumVolumeViewFactory = createDynamicFactory<CesiumVolumeView>('cesiumVolumeView');
