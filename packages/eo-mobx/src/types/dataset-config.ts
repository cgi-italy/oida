import { AnyFormFieldDefinition } from '@oida/core';

import { DatasetTimeDistributionConfig } from './dataset-time-distribution-config';
import { DatasetProductSearchConfig } from './dataset-product-search-config';
import { DatasetDownloadConfig } from './dataset-download-config';
import { DatasetToolConfig } from './dataset-tool-config';
import { DatasetViz } from '../models';

export type DatasetConfig = {
    id: string;
    name: string;
    thumb?: string;
    description?: string;
    color?: string;
    icon?: string;
    filters: AnyFormFieldDefinition[];
    timeDistribution?: DatasetTimeDistributionConfig;
    productSearch?: DatasetProductSearchConfig;
    spatialCoverageProvider?: (datasetViz: DatasetViz<any>) => Promise<number[]>;
    mapView?: {type: string, props: Record<string, any>};
    tools?: DatasetToolConfig[];
    download?: DatasetDownloadConfig;
};
