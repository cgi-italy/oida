import { types, Instance } from 'mobx-state-tree';

import { hasConfig, QueryParams } from '@oida/state-mst';

import { DatasetConfig } from './dataset-config';

const DatasetDecl = types.compose(
    'EODataset',
    types.model({
        id: types.identifier,
        searchParams: QueryParams
    }),
    hasConfig<DatasetConfig>()
);

type DatasetType = typeof DatasetDecl;
export interface DatasetInterface extends DatasetType {}
export const Dataset: DatasetInterface = DatasetDecl;
export interface IDataset extends Instance<DatasetInterface> {}
