import { types, Instance } from 'mobx-state-tree';

import { needsConfig, QueryParams } from '@oida/state-mst';

import { DatasetConfig } from './dataset-config';

const DatasetDecl = types.compose(
    'EODataset',
    types.model({
        id: types.identifier,
        searchParams: QueryParams
    }),
    needsConfig<DatasetConfig>()
);

type DatasetType = typeof DatasetDecl;
export interface DatasetInterface extends DatasetType {}
export const Dataset: DatasetInterface = DatasetDecl;
export interface IDataset extends Instance<DatasetInterface> {}
