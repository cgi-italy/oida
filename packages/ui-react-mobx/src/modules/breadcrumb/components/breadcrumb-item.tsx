import React, { useEffect } from 'react';

import { IndexedCollection } from '@oidajs/state-mobx';
import { BreadcrumbItemProps } from '@oidajs/ui-react-core';

import { useBreadcrumbModule } from '../hooks/use-breadcrumb-module';

export type BreadcrumbItemInjectorProps = {
    breadcrumb: IndexedCollection<BreadcrumbItemProps>;
    data: BreadcrumbItemProps;
};

export const BreadcrumbItemInjector = (props: BreadcrumbItemInjectorProps) => {
    const { breadcrumb, data } = props;

    useEffect(() => {
        if (data) {
            const idx = breadcrumb.items.findIndex((item) => item.key === data.key);
            if (idx !== -1) {
                breadcrumb.update(idx, data);
            } else {
                breadcrumb.add(data);
            }
        }
        return () => {
            if (data) {
                const item = breadcrumb.items.find((item) => item.key === data.key);
                if (item) {
                    breadcrumb.remove(item);
                }
            }
        };
    }, [breadcrumb]);

    useEffect(() => {
        const idx = breadcrumb.items.findIndex((item) => item.key === data.key);
        if (idx !== -1) {
            breadcrumb.update(idx, data);
        }
    }, [data]);

    return null;
};

export const BreadcrumbItem = (props: Omit<BreadcrumbItemInjectorProps, 'breadcrumb'> & { breadcrumbModuleId?: string }) => {
    const breadcrumbModule = useBreadcrumbModule(props.breadcrumbModuleId);

    return <BreadcrumbItemInjector key={props.data.key} breadcrumb={breadcrumbModule.breadcrumb} {...props} />;
};
