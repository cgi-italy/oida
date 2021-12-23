import { useEffect } from 'react';
import { values, autorun } from 'mobx';

import { getFormFieldSerializer, IFormFieldDefinition, QueryFilter } from '@oidajs/core';
import { DataFilters } from '@oidajs/state-mobx';

import { BreadcrumbItemProps } from '@oidajs/ui-react-core';

import { serializeQueryFilters } from '../../../core/hooks/use-query-criteria-url-binding';
import { BreadcrumbModule } from '../breadcrumb-module';
import { useBreadcrumbModule } from './use-breadcrumb-module';

export type QueryFilterBreadcrumbBindingProps = {
    filtersConfig: IFormFieldDefinition[];
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

        const filterTrackerDisposer = autorun(() => {
            clearBreadcrumbItems();

            const filterValues = values(props.filteringState.items) as QueryFilter[];

            filterValues.forEach((filter, idx) => {
                const filterUrlString = serializeQueryFilters(filterValues.slice(0, idx + 1));
                const filterConfig = props.filtersConfig.find((f) => {
                    return f.name === filter.key;
                });

                if (filterConfig) {
                    const serializer = getFormFieldSerializer(filter.type);
                    if (serializer) {
                        const filterTitle = serializer.toString({
                            value: filter.value,
                            onChange: () => {
                                //do nothing
                            },
                            ...filterConfig
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
