import { SortOrder } from './sort-order';

export type QueryParams = {
    paging?: {page: number, pageSize: number, offset: number};
    filters?: Array<{key: string, value: any}>;
    sortBy?: {key: string, order: SortOrder};
};
