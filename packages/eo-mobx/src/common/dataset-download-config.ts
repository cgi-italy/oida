import { IFormFieldDefinition } from '@oidajs/core';

import { DatasetViz } from './dataset-viz';

export type DownloadFormat = {
    id: string;
    name?: string;
};

export type DownloaMapVizRequest<T extends DatasetViz<string, any> = DatasetViz<string, any>> = {
    datasetViz: T;
    format: string;
    options?: Record<string, any>;
};

export type DatasetDownloadConfig = {
    downloadProvider: (request: DownloaMapVizRequest) => Promise<void>;
    supportedFormats: DownloadFormat[];
    supportedOptions?: {
        fields: IFormFieldDefinition[];
        defaultValues: Record<string, any>;
    };
};
