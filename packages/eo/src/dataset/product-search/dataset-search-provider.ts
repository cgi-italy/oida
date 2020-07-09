import { QueryParams } from '@oida/core';

import { ProductSearchRecord } from './dataset-product';

export interface DatasetSearchProvider {
    searchProducts: (queryParams: QueryParams) => Promise<{total: number, results: ProductSearchRecord[]}>;
}

