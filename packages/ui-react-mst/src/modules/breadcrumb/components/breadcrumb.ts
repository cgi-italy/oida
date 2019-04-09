import React from 'react';
import { observer } from 'mobx-react';

import { BreadcrumbItemProps, BreadcrumbRenderer } from '@oida/ui-react-core';

import { IBreadcrumbModuleStateModel, DefaultBreadcrumbModule, BreadcrumbModule } from '../breadcrumb-module';
import { injectFromModuleState } from '../../with-app-module';

export type BreadcrumbProps = {
    render: BreadcrumbRenderer,
    breadcrumb: IBreadcrumbModuleStateModel,
    linkItem: React.ComponentType<BreadcrumbItemProps>
};


class BreadcrumbBase extends React.Component<BreadcrumbProps> {

    render() {
        let {render, breadcrumb, linkItem} = this.props;

        return render({
            items: breadcrumb.items.map((item) => {
                return {
                    key: item.key,
                    title: item.title,
                    link: item.link,
                    onClick: item.onClick
                };
            }),
            linkItem: linkItem
        });
    }
}

export const Breadcrumb = observer(BreadcrumbBase);

export const injectBreadcrumbStateFromModule =
(breadcrumbModule: BreadcrumbModule) => injectFromModuleState(breadcrumbModule, (moduleState) => {
    return {
        breadcrumb: moduleState
    };
});

export const BreadcrumbS = injectBreadcrumbStateFromModule(DefaultBreadcrumbModule)(Breadcrumb);
