import { useObserver } from 'mobx-react-lite';

import { IDataSorting } from '@oida/state-mst';
import { DataSortField, DataSorterProps } from '@oida/ui-react-core';

export type DataSortingProps = {
    sortingState: IDataSorting;
    sortableFields: DataSortField[];
};

export const useDataSorting = ({sortableFields, sortingState}: DataSortingProps) => {
    return useObserver(() => {
        return {
            sortableFields: sortableFields,
            sortKey: sortingState.key,
            sortOrder: sortingState.order,
            onSortChange: (sortParams) => {
                sortingState.sortBy(sortParams);
            },
            onSortClear: () => {
                sortingState.clear();
            }
        } as DataSorterProps;
    });
};
