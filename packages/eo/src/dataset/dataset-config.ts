import { AnyFormFieldDefinition } from '@oida/ui-react-core';

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
    mapView?: {type: string, config: any};
    tools?: {type: string, config: any}[];
    download?: DatasetDownloadConfig;
};
