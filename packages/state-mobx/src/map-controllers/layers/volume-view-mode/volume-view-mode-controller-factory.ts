import { createDynamicFactory } from '@oidajs/core';

import { VolumeViewModeController } from './volume-view-mode-controller';

export const volumeViewModeControllerFactory = createDynamicFactory<VolumeViewModeController>('volumeViewModeController');
