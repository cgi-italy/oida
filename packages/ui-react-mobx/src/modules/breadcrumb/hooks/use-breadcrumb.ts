import { IndexedCollection } from '@oida/state-mobx';
import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { useSelector } from '../../../core/hooks';
import { useBreadcrumbModule } from './use-breadcrumb-module';


export type useBreadcrumbProps = {
    breadcrumb: IndexedCollection<BreadcrumbItemProps>
    minLevel?: number;
    maxLevel?: number;
};

export const useBreadcrumb = (props: useBreadcrumbProps) => {
    return useSelector(() => {
        let items = props.breadcrumb.items.map((item) => {
            return {
                key: item.key,
                title: item.title,
                link: item.link,
                onClick: item.onClick
            };
        });
        return {
            items: items.slice(props.minLevel, props.maxLevel)
        };
    }, [props.breadcrumb, props.minLevel, props.maxLevel]);
};

export const useBreadcrumbFromModule = (props?: Omit<useBreadcrumbProps, 'breadcrumb'>, breadcrumbModuleId?: string) => {
    const breadcrumbModule = useBreadcrumbModule(breadcrumbModuleId);

    return useBreadcrumb({
        breadcrumb: breadcrumbModule.breadcrumb,
        ...props
    });
};
