import { AnyFormFieldDefinition } from '@oida/core';
import { DataFilters } from '@oida/state-mobx';
import { DataFiltererProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

export type DataFilteringProps = {
    filteringState?: DataFilters;
    filters: AnyFormFieldDefinition[];
    trackFilterDefinitions?: boolean;
};

export const useDataFiltering = (props: DataFilteringProps) => {

    const { filteringState, filters } = props;

    const hooksDeps: React.DependencyList = props.trackFilterDefinitions ? [filteringState, filters] : [filteringState];

    return useSelector(() => {
        if (!filteringState) {
            return;
        }

        let values = new Map<string, any>();
        filteringState.asArray().forEach((item) => {
            values.set(item.key, item.value);
        });

        return {
            filters: filters,
            values: values,
            onFilterChange: (name, value) => {
                if (value !== undefined) {
                    let filterConfig = props.filters.find((f) => {
                        return f.name === name;
                    });
                    if (filterConfig) {
                        filteringState.set(name, value, filterConfig.type);
                    }
                } else {
                    filteringState.unset(name);
                }
            }
        } as DataFiltererProps;
    }, hooksDeps);
};
