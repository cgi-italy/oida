import { useObserver } from 'mobx-react';

import { IDataFilters } from '@oida/state-mst';
import { AnyFormFieldDefinition, DataFiltererProps } from '@oida/ui-react-core';

export type DataFilteringProps = {
    filteringState?: IDataFilters;
    filters: AnyFormFieldDefinition[];
};

export const useDataFiltering = ({filters, filteringState}: DataFilteringProps) => {
    return useObserver(() => {
        if (!filteringState) {
            return;
        }

        let values = new Map<string, any>();
        filteringState.items.forEach((item) => {
            values.set(item.key, item.value);
        });

        return {
            filters: filters,
            values: values,
            onFilterChange: (name, value) => {
                if (value) {
                    let filterConfig = filters.find((f) => {
                        return f.name === name;
                    });
                    filteringState.set(name, value, filterConfig ? filterConfig.type : undefined);
                } else {
                    filteringState.unset(name);
                }
            }
        } as DataFiltererProps;
    });
};
