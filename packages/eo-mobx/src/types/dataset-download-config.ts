import { DatasetViz } from '../models/dataset-viz';

export type DownloadFormat = {
    id: string;
    name?: string;
};

export type DownloaMapVizRequest = {
    datasetViz: DatasetViz<any>;
    format: string;
    scale?: number;
};

export type DatasetDownloadConfig = {
    downloadProvider: (request: DownloaMapVizRequest) => Promise<void>;
    supportedFormats: DownloadFormat[];
};
