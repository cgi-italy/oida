import React from 'react';

import { createDynamicFactory } from '@oida/core';

import { Dataset, ComboAnalysis } from '@oida/eo-mobx';

export const DatasetAnalysisWidgetFactory = createDynamicFactory<React.ReactNode>('dataset-analysis-widget');

export type DatasetAnalysisWidgetFactoryConfig = {
    datasets: Dataset[];
    combinedAnalysis: ComboAnalysis,
    availableCombos: Record<string, Array<ComboAnalysis>>;
};
