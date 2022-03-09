import { IndexedCollection } from '@oidajs/state-mobx';
import { BreadcrumbItemProps } from '@oidajs/ui-react-core';

import { useSelector } from '../../../core/hooks';
import { useBreadcrumbModule } from './use-breadcrumb-module';

/**
 * {@link useBreadcrumb} hook input properties
 */
export type useBreadcrumbProps = {
    /** the breadcrumb observable state */
    breadcrumb: IndexedCollection<BreadcrumbItemProps>;
    /**
     * the min level breadcrumb item to extract from the state. It can be a number
     * representing the item index or a string representing the item key
     */
    minLevel?: number | string;
    /**
     * the max level breadcrumb to extract from the state. It can be a number
     * representing the item index or a string representing the item key
     */
    maxLevel?: number | string;
};

/**
 * react hooks that extracts the breadcrumb items from the state.
 */
export const useBreadcrumb = (props: useBreadcrumbProps) => {
    return useSelector(() => {
        const items: BreadcrumbItemProps[] = props.breadcrumb.items.map((item) => {
            return {
                ...item
            };
        });
        let minLevel: number | undefined;
        let maxLevel: number | undefined;
        if (typeof props.minLevel === 'string') {
            minLevel = items.findIndex((item) => item.key === props.minLevel);
            if (minLevel === -1) {
                minLevel = undefined;
            }
        } else {
            minLevel = props.minLevel;
        }
        if (typeof props.maxLevel === 'string') {
            maxLevel = items.findIndex((item) => item.key === props.maxLevel);
            if (maxLevel === -1) {
                maxLevel = undefined;
            }
        } else {
            maxLevel = props.maxLevel;
        }
        return {
            items: items.slice(minLevel, maxLevel)
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
