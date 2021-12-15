import { IFormFieldDefinition } from '@oidajs/core';

import { DatasetVizConfig, DatasetVizDefinitions } from '../common';
import { DatasetTimeDistributionConfig } from './dataset-time-distribution-config';
import { DatasetProductSearchConfig } from './dataset-product-search-config';
import { DatasetDownloadConfig } from './dataset-download-config';
import { DatasetToolConfig } from './dataset-tool-config';
import { DatasetSpatialCoverageProvider } from './dataset-spatial-coverage-provider';


export type DatasetMapViewConfig<MAP_VIEW_TYPE extends keyof DatasetVizDefinitions> = {
    type: MAP_VIEW_TYPE;
    config: DatasetVizConfig<MAP_VIEW_TYPE>;
};

/**
 * EO Dataset configuration object. A dataset is a collection of homogeneous EO products
 * (e.g. a series of Satellite images collected over time and space, a collection of in-situ data, etc. )
 * It can be used as input to {@link DatasetExplorer.addDataset} to add the dataset
 */
export type DatasetConfig<MAP_VIEW_TYPE extends keyof DatasetVizDefinitions = keyof DatasetVizDefinitions> = {
    /** The unique dataset identifier */
    id: string;
    /** The dataset name */
    name: string;
    /** An optional dataset thumbnail. Not used anywhere yet */
    thumb?: string;
    /** The dataset description */
    description?: string;
    /** A color identifier. If not provider it will be automatically generated */
    color?: string;
    /** An optional dataset icon. Not used anywhere yet */
    icon?: string;
    /**
     * By default a dataset will have spatial and temporal filters. Provide here any additional filters supported
     * by this dataset for product search
     */
    filters: IFormFieldDefinition[];
    /** The configuration for dataset time distribution retrieval. If not provided the dataset will be considered timeless */
    timeDistribution?: DatasetTimeDistributionConfig;
    /**
     * The configuration for product retrieval within the dataset. The filters provided in {@link DatasetConfig.filters}
     * will be available for search.
     * If not provided it will not possible to search for dataset products
    */
    productSearch?: DatasetProductSearchConfig;
    /** The dataset spatial domain provider. It returns the dataset spatial extent for the current dataset map visualization. */
    spatialCoverageProvider?: DatasetSpatialCoverageProvider;
    /** The map view configuration for the dataset */
    mapView?: DatasetMapViewConfig<MAP_VIEW_TYPE>
    /** The configuration of the analytics tools supported by the dataset */
    tools?: DatasetToolConfig[];
    /** Dataset download configuration */
    download?: DatasetDownloadConfig;
};
