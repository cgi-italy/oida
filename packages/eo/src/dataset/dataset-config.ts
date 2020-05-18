import { AnyFormFieldDefinition } from '@oida/core';

import { DatasetProductSearchConfig } from './product-search';
import { DatasetTimeDistributionConfig } from './time-distribution';
import { DatasetDownloadConfig } from './download';

export type DatasetConfig = {
    id: string;
    name: string;
    thumb?: string;
    description?: string;
    color?: string;
    icon?: string;
    filters: AnyFormFieldDefinition[];
    search?: DatasetProductSearchConfig;
    timeDistribution?: DatasetTimeDistributionConfig;
    spatialCoverageProvider?: (filters?) => Promise<number[]>;
    mapView?: {type: string, config: any};
    tools?: {
        type: string,
        name: string,
        icon: any,
        config: {
            [props: string]: any
        }}[];
    download?: DatasetDownloadConfig;
};
