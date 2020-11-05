import { SLICE_VOLUME_VIEW_ID, STACK_VOLUME_VIEW_ID } from '@oida/core';

import { volumeViewModeControllerFactory } from './volume-view-mode-controller-factory';

import { VolumeStackViewController } from './volume-stack-view-controller';
import { VolumeSliceViewController } from './volume-slice-view-controller';

volumeViewModeControllerFactory.register(STACK_VOLUME_VIEW_ID, (config) => {
    return new VolumeStackViewController(config);
});

volumeViewModeControllerFactory.register(SLICE_VOLUME_VIEW_ID, (config) => {
    return new VolumeSliceViewController(config);
});


export { volumeViewModeControllerFactory, VolumeStackViewController, VolumeSliceViewController };
export * from './volume-view-mode-controller';
