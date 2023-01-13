import { createDynamicFactory } from '@oidajs/core';
import { DatasetExplorerItemConfig } from '../dataset-discovery';

/**
 * A factory for dataset config generation from a serialized json object
 */
export const datasetConfigFactory = createDynamicFactory<Promise<DatasetExplorerItemConfig>>('datasetConfig');
