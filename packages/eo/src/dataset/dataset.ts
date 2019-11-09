import { types, Instance } from 'mobx-state-tree';

import { needsConfig, QueryParams } from '@oida/state-mst';

import { DatasetConfig } from './dataset-config';

export const Dataset = types.compose(
    'EODataset',
    types.model({
        id: types.identifier,
        searchParams: QueryParams
    }),
    needsConfig<DatasetConfig>()
);

export type IDataset = Instance<typeof Dataset>;

