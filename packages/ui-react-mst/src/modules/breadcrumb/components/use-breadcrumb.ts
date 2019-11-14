import { useObserver } from 'mobx-react';

import { IBreadcrumbModuleStateModel } from '../breadcrumb-module';
import { useBreadcrumbModuleState } from '../use-breadcrumb-module-state';

export type BreadcrumbProps = {
    breadcrumb: IBreadcrumbModuleStateModel
};

export const useBreadcrumbBase = ({breadcrumb}: BreadcrumbProps) => {
    return useObserver(() => ({
        items: breadcrumb.items.map((item) => {
            return {
                key: item.key,
                title: item.title,
                link: item.link,
                onClick: item.onClick
            };
        })
    }));
};

export const useBreadcrumb = (breadcrumbModule?) => {
    const breadcrumb = useBreadcrumbModuleState(breadcrumbModule);

    return useBreadcrumbBase({
        breadcrumb
    });
};
