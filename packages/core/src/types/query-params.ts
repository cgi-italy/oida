import { SortOrder } from './sort-order';

export type QueryFilter = {
    key: string;
    value: any;
    type: string;
};

export type QueryParams = {
    paging?: {page: number, pageSize: number, offset: number};
    filters?: Array<QueryFilter>;
    sortBy?: {key: string, order: SortOrder};
};
