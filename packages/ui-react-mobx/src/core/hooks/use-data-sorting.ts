import { DataSorting } from '@oidajs/state-mobx';
import { DataSortField, DataSorterProps } from '@oidajs/ui-react-core';

import { useSelector } from './use-selector';

export type DataSortingProps = {
    sortingState?: DataSorting;
    sortableFields: DataSortField[];
};

export const useDataSorting = (props: DataSortingProps) => {

    const {sortableFields, sortingState} = props;

    return useSelector(() => {

        if (!sortingState) {
            return;
        }

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
    }, [sortingState]);
};
