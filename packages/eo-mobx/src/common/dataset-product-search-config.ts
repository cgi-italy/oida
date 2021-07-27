import { DatasetProductSearchProvider, ProductSearchRecord } from './dataset-product-search-provider';

export type DatasetProductSearchConfig = {
    searchProvider: DatasetProductSearchProvider;
    searchItemContent?: (product: ProductSearchRecord) => any;
};
