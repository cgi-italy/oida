import React from 'react';

import { BreadcrumbItemProps } from '@oida/ui-react-core';


import { IBreadcrumb, BREADCRUMB_MODULE_DEFAULT_ID } from '../breadcrumb-module';
import { IBreadcrumbItem } from '../types/breadcrumb-item';
import { inject } from '../../../utils';

export type BreadcrumbItemInjectorProps = {
    breadcrumb: IBreadcrumb,
    breadcrumbData: BreadcrumbItemProps
};

type BreadcrumbItemInjectorState = {
    breadcrumbItem: IBreadcrumbItem
};

export class BreadcrumbItemInjector extends React.Component<BreadcrumbItemInjectorProps, BreadcrumbItemInjectorState> {

    componentDidMount() {
        this.props.breadcrumb.add(this.props.breadcrumbData);
        this.setState({
            breadcrumbItem: this.props.breadcrumb.itemWithId(this.props.breadcrumbData.key)
        });
    }

    componentDidUpdate(prevProps) {

        if (
            prevProps.breadcrumbData.title !== this.props.breadcrumbData.title ||
            prevProps.breadcrumbData.link !== this.props.breadcrumbData.link
        ) {

            this.state.breadcrumbItem.update(this.props.breadcrumbData);
        }
    }

    componentWillUnmount() {
        this.props.breadcrumb.remove(this.state.breadcrumbItem);
        this.setState({
            breadcrumbItem: null
        });
    }

    render() {
        return null;
    }
}

export const BreadcrumbItemInjectorS = inject(({appState}) => {
    return {
        breadcrumb: appState[BREADCRUMB_MODULE_DEFAULT_ID]
    };
})(BreadcrumbItemInjector);
