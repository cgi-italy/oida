import { QueryParams, CancelablePromise } from '@oida/core';

import { ProductSearchRecord } from './dataset-product';

export interface DatasetSearchProvider {
    searchProducts: (queryParams: QueryParams) => CancelablePromise<{total: number, results: ProductSearchRecord[]}>;
}

