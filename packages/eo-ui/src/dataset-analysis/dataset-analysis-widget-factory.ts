import React from 'react';

import { createDynamicFactory } from '@oida/core';

export const DatasetAnalysisWidgetFactory = createDynamicFactory<React.ReactNode>('dataset-analysis-widget');
