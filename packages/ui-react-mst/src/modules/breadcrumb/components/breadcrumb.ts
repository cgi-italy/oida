import React from 'react';
import { observer } from 'mobx-react';

import { IBreadcrumb, BREADCRUMB_MODULE_DEFAULT_ID } from '../breadcrumb-module';
import { BreadcrumbItemProps, BreadcrumbRenderer } from '@oida/ui-react-core';

import { inject } from '../../../utils';

export type BreadcrumbProps = {
    render: BreadcrumbRenderer,
    state: IBreadcrumb,
    linkItem: React.ComponentType<BreadcrumbItemProps>
};


class BreadcrumbBase extends React.Component<BreadcrumbProps> {

    render() {
        let {render, state, linkItem} = this.props;

        return render({
            items: state.items.map((item) => {
                return {
                    key: item.key,
                    title: item.title,
                    link: item.link
                };
            }),
            linkItem: linkItem
        });
    }
}

export const Breadcrumb = observer(BreadcrumbBase);

export const BreadcrumbS = inject(({appState}) => {
    return {
        state: appState[BREADCRUMB_MODULE_DEFAULT_ID]
    };
})(observer(BreadcrumbBase));
