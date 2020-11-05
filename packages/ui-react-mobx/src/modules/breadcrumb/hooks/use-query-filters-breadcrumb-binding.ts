import { useEffect } from 'react';
import { values, autorun } from 'mobx';

import { getFormFieldSerializer, AnyFormFieldDefinition, QueryFilter } from '@oida/core';
import { DataFilters } from '@oida/state-mobx';

import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { serializeQueryFilters } from '../../../core/hooks/use-query-criteria-url-binding';
import { BreadcrumbModule } from '../breadcrumb-module';
import { useBreadcrumbModule } from './use-breadcrumb-module';


export type QueryFilterBreadcrumbBindingProps = {
    filtersConfig: AnyFormFieldDefinition[];
    filteringState: DataFilters;
    breadcrumbModule: BreadcrumbModule;
};

export const useQueryFiltersBreadcrumbBinding = (props: QueryFilterBreadcrumbBindingProps) => {

    useEffect(() => {

        const breadcrumbItems: BreadcrumbItemProps[] = [];

        const clearBreadcrumbItems = () => {
            breadcrumbItems.forEach((item) => {
                props.breadcrumbModule.breadcrumb.remove(item);
            });
            breadcrumbItems.length = 0;
        };

        let filterTrackerDisposer = autorun(() => {

            clearBreadcrumbItems();

            let filterValues = values(props.filteringState.items) as QueryFilter[];

            filterValues.forEach((filter, idx) => {

                let filterUrlString = serializeQueryFilters(filterValues.slice(0, idx + 1));
                let filterConfig = props.filtersConfig.find((f) => {
                    return f.name === filter.key;
                });

                if (filterConfig) {

                    let serializer = getFormFieldSerializer(filter.type);
                    if (serializer) {

                        const filterTitle = serializer.toString({
                            title: filterConfig.title || filterConfig.name,
                            config: filterConfig.config,
                            value: filter.value
                        });

                        const breadcrumbItem = {
                            key: filter.key,
                            title: filterTitle,
                            link: `${window.location.pathname}?q=${filterUrlString}`
                        };

                        props.breadcrumbModule.breadcrumb.add(breadcrumbItem);

                        breadcrumbItems.push(breadcrumbItem);
                    }
                }

            });

        });
        return () => {
            clearBreadcrumbItems();
            filterTrackerDisposer();
        };

    }, []);

};

export const useQueryFiltersBreadcrumbBindingFromModule = (props: Omit<QueryFilterBreadcrumbBindingProps, 'breadcrumbModule'>) => {
    const breadcrumbModule = useBreadcrumbModule();
    return useQueryFiltersBreadcrumbBinding({
        breadcrumbModule,
        ...props
    });
};
