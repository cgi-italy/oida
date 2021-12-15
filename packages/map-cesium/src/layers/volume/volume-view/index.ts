import { STACK_VOLUME_VIEW_ID, SLICE_VOLUME_VIEW_ID } from '@oidajs/core';

import { cesiumVolumeViewFactory } from './cesium-volume-view-factory';
import { CesiumStackVolumeView } from './cesium-stack-volume-view';
import { CesiumSliceVolumeView } from './cesium-slice-volume-view';

cesiumVolumeViewFactory.register(STACK_VOLUME_VIEW_ID, (config) => {
    return new CesiumStackVolumeView(config);
});

cesiumVolumeViewFactory.register(SLICE_VOLUME_VIEW_ID, (config) => {
    return new CesiumSliceVolumeView(config);
});


export { cesiumVolumeViewFactory, CesiumStackVolumeView, CesiumSliceVolumeView };
export * from './cesium-volume-view';
