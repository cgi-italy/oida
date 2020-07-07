import React from 'react';

import { createDynamicFactory } from '@oida/core';

import { DatasetConfig, IComboAnalysis } from '@oida/eo';

export const DatasetAnalysisWidgetFactory = createDynamicFactory<React.ReactNode>('dataset-analysis-widget');

export type DatasetAnalysisWidgetFactoryConfig = {
    datasets: DatasetConfig[];
    combinedAnalysis: IComboAnalysis,
    linkedAois: Set<string>,
    availableCombos: Record<string, Array<{id: string, name: string}>>;
};
