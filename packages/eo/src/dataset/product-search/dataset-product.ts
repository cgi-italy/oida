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

const DatasetProductDecl = Entity.addModel(
    Product
);


type DatasetProductType = typeof DatasetProductDecl;
export interface DatasetProductInterface extends DatasetProductType {}
export const DatasetProduct: DatasetProductInterface = DatasetProductDecl;
export interface IDatasetProduct extends Instance<DatasetProductInterface> {}
export type ProductSearchRecord = SnapshotIn<DatasetProductInterface>;


const DatasetProductsDecl = createEntityCollectionType(DatasetProduct);

type DatasetProductsType = typeof DatasetProductsDecl;
export interface DatasetProductsInterface extends DatasetProductsType {}
export const DatasetProducts: DatasetProductsInterface = DatasetProductsDecl;
export interface IDatasetProducts extends Instance<DatasetProductsInterface> {}
