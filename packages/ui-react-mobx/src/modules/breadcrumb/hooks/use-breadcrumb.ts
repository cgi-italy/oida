import { IndexedCollection } from '@oida/state-mobx';
import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { useSelector } from '../../../core/hooks';
import { useBreadcrumbModule } from './use-breadcrumb-module';


export type BreadcrumbProps = {
    breadcrumb: IndexedCollection<BreadcrumbItemProps>
};

export const useBreadcrumb = (props: BreadcrumbProps) => {
    return useSelector(() => ({
        items: props.breadcrumb.items.map((item) => {
            return {
                key: item.key,
                title: item.title,
                link: item.link,
                onClick: item.onClick
            };
        })
    }), [props.breadcrumb]);
};

export const useBreadcrumbFromModule = (breadcrumbModuleId?: string) => {
    const breadcrumbModule = useBreadcrumbModule(breadcrumbModuleId);

    return useBreadcrumb({
        breadcrumb: breadcrumbModule.breadcrumb
    });
};
