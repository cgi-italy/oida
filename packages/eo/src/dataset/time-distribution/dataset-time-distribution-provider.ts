import { SnapshotIn } from 'mobx-state-tree';

import {  CancelablePromise } from '@oida/core';

import { TimeDistributionItem } from './time-dimension';

export type STimeDistributionItem = SnapshotIn<typeof TimeDistributionItem>;

export interface DatasetTimeDistributionProvider {
    supportsHistograms: () => boolean;
    getTimeDistribution: (timeRange, filters) => CancelablePromise<STimeDistributionItem[]>;
    getTimeExtent: (filters) => Promise<STimeDistributionItem | null>;
}
