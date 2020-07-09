import { IDatasetViz } from '../dataset-viz';

export type DownloaMapVizRequest = {
    datasetViz: IDatasetViz;
    format: string;
    scale?: number;
};

export interface DatasetDownloadProvider {
    downloadMapViz: (request: DownloaMapVizRequest) => Promise<void>;
}

