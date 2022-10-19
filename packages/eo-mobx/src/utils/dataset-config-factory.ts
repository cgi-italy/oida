import { createDynamicFactory } from '@oidajs/core';
import { DatasetConfig } from '../common';

/**
 * A factory for dataset config generation from a serialized json object
 */
export const datasetConfigFactory = createDynamicFactory<Promise<DatasetConfig>>('datasetConfig');
