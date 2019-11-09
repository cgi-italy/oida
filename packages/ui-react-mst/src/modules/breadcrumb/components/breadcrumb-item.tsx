import React, { useEffect, useState } from 'react';

import { Omit } from '@oida/core';
import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { useBreadcrumbModuleState } from '../use-breadcrumb-module-state';

import { IBreadcrumbItem } from '../types/breadcrumb-item-model';
import { IBreadcrumbModuleStateModel } from '../breadcrumb-module';

export type BreadcrumbItemInjectorProps = {
    breadcrumbState: IBreadcrumbModuleStateModel,
    data: BreadcrumbItemProps
};

export const BreadcrumbItemBase = ({breadcrumbState, data}: BreadcrumbItemInjectorProps) => {

    const [breadcrumbItem, setBreadcrumbItem] = useState<IBreadcrumbItem>();

    useEffect(() => {

        let breadcrumbItem = breadcrumbState.add(data);
        setBreadcrumbItem(breadcrumbItem);

        return () => {
            breadcrumbState.remove(breadcrumbItem);
            setBreadcrumbItem(undefined);
        };
    }, [breadcrumbState]);

    useEffect(() => {
        if (breadcrumbItem) {
            breadcrumbItem.update(data);
        }
    }, [data]);

    return null;

};

export const BreadcrumbItem = (props: Omit<BreadcrumbItemInjectorProps, 'breadcrumbState'>) => {
    const breadcrumbState = useBreadcrumbModuleState();

    return <BreadcrumbItemBase breadcrumbState={breadcrumbState} {...props}/>;
};