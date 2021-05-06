import React from 'react';

import { createDynamicFactory } from '@oida/core';

import { DatasetExplorerItem, ComboAnalysis } from '@oida/eo-mobx';

export const DatasetAnalysisWidgetFactory = createDynamicFactory<React.ReactNode>('dataset-analysis-widget');

export type DatasetAnalysisWidgetFactoryConfig = {
    datasetExplorerItems: DatasetExplorerItem[];
    combinedAnalysis: ComboAnalysis,
    availableCombos: Record<string, Array<ComboAnalysis>>;
};
