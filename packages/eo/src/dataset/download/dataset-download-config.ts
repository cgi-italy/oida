import { DatasetDownloadProvider } from './dataset-download-provider';

export type DownloadFormat = {
    id: string;
    name?: string;
};

export type DatasetDownloadConfig = {
    downloadProvider: DatasetDownloadProvider;
    supportedFormats: DownloadFormat[];
};
