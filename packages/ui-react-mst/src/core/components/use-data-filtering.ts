import { useObserver } from 'mobx-react';

import { IDataFilters } from '@oida/state-mst';
import { AnyFormFieldDefinition, DataFiltererProps } from '@oida/ui-react-core';

export type DataFilteringProps = {
    filteringState: IDataFilters;
    filters: AnyFormFieldDefinition[];
};

export const useDataFiltering = ({filters, filteringState}: DataFilteringProps) => {
    return useObserver(() => {
        let values = new Map<string, any>();
        filteringState.items.forEach((item) => {
            values.set(item.key, item.value);
        });

        return {
            filters: filters,
            values: values,
            onFilterChange: (name, value) => {
                if (value) {
                    filteringState.set(name, value);
                } else {
                    filteringState.unset(name);
                }
            }
        } as DataFiltererProps;
    });
};
