import { QueryParams, CancelablePromise } from '@oida/core';

import { IDatasetMapViz } from '../dataset-viz';

export type DownloaMapVizRequest = {
    datasetViz: IDatasetMapViz;
    format: string;
    scale?: number;
};

export interface DatasetDownloadProvider {
    downloadMapViz: (request: DownloaMapVizRequest) => void;
}

