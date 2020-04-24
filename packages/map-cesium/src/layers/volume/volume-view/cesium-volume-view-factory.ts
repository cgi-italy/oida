import { createDynamicFactory } from '@oida/core';
import { CesiumVolumeView } from './cesium-volume-view';

export const cesiumVolumeViewFactory = createDynamicFactory<CesiumVolumeView>('cesiumVolumeView');
