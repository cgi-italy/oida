import { DatasetSearchProvider } from './dataset-search-provider';
import { DatasetProductSearchLayerFactory } from './dataset-product-search-layer-factory';

import { IDatasetProduct } from './dataset-product';

export type DatasetProductSearchConfig = {
    searchProvider: DatasetSearchProvider;
    searchItemContent?: (item: IDatasetProduct) => React.ReactNode;
    mapLayerFactory?: DatasetProductSearchLayerFactory;
};
