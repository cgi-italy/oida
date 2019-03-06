import { SortOrder } from '@oida/core';

export type DataSortField = {
    key: string;
    name: string;
};

export type DataSorterProps = {
    sortableFields: Array<DataSortField>;
    sortKey: string;
    sortOrder: SortOrder;
    onSortChange: (sortBy: {key?: string, order?: SortOrder}) => void;
    onSortClear: () => void;
};

export type DataSorterRenderer = (props: DataSorterProps) => React.ReactNode;
