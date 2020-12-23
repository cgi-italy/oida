import { QueryParams, Geometry } from '@oida/core';

export type ProductSearchRecord = {
    start: Date,
    end?: Date,
    metadata?: Record<string, any>;
    preview?: string,
    geometry: Geometry;
};

export interface DatasetProductSearchProvider {
    searchProducts: (queryParams: QueryParams) => Promise<{total: number, results: ProductSearchRecord[]}>;
}
