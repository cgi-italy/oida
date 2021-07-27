import React from 'react';

import { createDynamicFactory } from '@oida/core';

import { DatasetExplorerItem, DatasetAnalysis } from '@oida/eo-mobx';

export const DatasetAnalysisWidgetFactory = createDynamicFactory<React.ReactNode>('dataset-analysis-widget');

export type DatasetAnalysisWidgetFactoryConfig = {
    datasetExplorerItems: DatasetExplorerItem[];
    combinedAnalysis: DatasetAnalysis,
    availableCombos: Record<string, Array<DatasetAnalysis>>;
};
