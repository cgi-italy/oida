import { types, Instance, SnapshotIn } from 'mobx-state-tree';

import { Entity, createEntityCollectionType, IsoDate, hasGeometry } from '@oida/state-mst';

const Product = types.compose('DatasetProduct',
    types.model({
        properties: types.frozen(),
        start: IsoDate,
        end: types.maybe(IsoDate),
        preview: types.maybe(types.string)
    }),
    hasGeometry
);

export const DatasetProduct = Entity.addModel(
    Product
);

export const DatasetProducts = createEntityCollectionType(DatasetProduct);

export type IDatasetProduct = Instance<typeof DatasetProduct>;
export type IDatasetProducts = Instance<typeof DatasetProducts>;
export type ProductSearchRecord = SnapshotIn<typeof DatasetProduct>;
