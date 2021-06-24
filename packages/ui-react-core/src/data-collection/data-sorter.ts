import { SortOrder } from '@oida/core';

export type DataSortField = {
    key: string;
    name: string;
};

/** {@Link DataSorterRenderer} props */
export type DataSorterProps = {
    sortableFields: Array<DataSortField>;
    sortKey: string;
    sortOrder: SortOrder;
    onSortChange: (sortBy: {key?: string, order?: SortOrder}) => void;
    onSortClear: () => void;
};

/** A data sorting component */
export type DataSorterRenderer = React.ComponentType<DataSorterProps>;
