import React from 'react';

import { createDynamicFactory } from '@oidajs/core';

export const DatasetVizSettingsFactory = createDynamicFactory<React.ReactNode>('dataset-viz-settings');
