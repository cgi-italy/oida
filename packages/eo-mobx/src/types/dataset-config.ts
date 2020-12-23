import { AnyFormFieldDefinition } from '@oida/core';

import { DatasetTimeDistributionConfig } from './dataset-time-distribution-config';
import { DatasetProductSearchConfig } from './dataset-product-search-config';
import { DatasetDownloadConfig } from './dataset-download-config';
import { DatasetToolConfig } from './dataset-tool-config';
import { DatasetSpatialCoverageProvider } from './dataset-spatial-coverage-provider';

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
    spatialCoverageProvider?: DatasetSpatialCoverageProvider;
    mapView?: {type: string, props: Record<string, any>};
    tools?: DatasetToolConfig[];
    download?: DatasetDownloadConfig;
};
