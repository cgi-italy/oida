import { QueryParams, CancelablePromise } from '@oida/core';

import { IDatasetViz } from '../dataset-viz';

export type DownloaMapVizRequest = {
    datasetViz: IDatasetViz;
    format: string;
    scale?: number;
};

export interface DatasetDownloadProvider {
    downloadMapViz: (request: DownloaMapVizRequest) => CancelablePromise<void>;
}

