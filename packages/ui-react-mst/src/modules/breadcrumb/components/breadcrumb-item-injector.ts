import React from 'react';

import { BreadcrumbItemProps } from '@oida/ui-react-core';

import { IBreadcrumbItem } from '../types/breadcrumb-item';
import { IBreadcrumbModuleStateModel, DefaultBreadcrumbModule } from '../breadcrumb-module';
import { injectBreadcrumbStateFromModule } from './breadcrumb';

export type BreadcrumbItemInjectorProps = {
    breadcrumb: IBreadcrumbModuleStateModel,
    breadcrumbData: BreadcrumbItemProps
};

type BreadcrumbItemInjectorState = {
    breadcrumbItem: IBreadcrumbItem
};

export class BreadcrumbItemInjector extends React.Component<BreadcrumbItemInjectorProps, BreadcrumbItemInjectorState> {

    componentDidMount() {
        this.props.breadcrumb.add(this.props.breadcrumbData);

        let breadcrumItem = this.props.breadcrumb.itemWithId(this.props.breadcrumbData.key);

        if (this.props.breadcrumbData.onClick) {
            breadcrumItem.update({
                onClick: this.props.breadcrumbData.onClick
            });
        }
        this.setState({
            breadcrumbItem: breadcrumItem
        });
    }

    componentDidUpdate(prevProps) {

        if (
            prevProps.breadcrumbData.title !== this.props.breadcrumbData.title ||
            prevProps.breadcrumbData.link !== this.props.breadcrumbData.link ||
            prevProps.breadcrumbData.onClick !== this.props.breadcrumbData.onClick
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

export const BreadcrumbItemInjectorS = injectBreadcrumbStateFromModule(DefaultBreadcrumbModule)(BreadcrumbItemInjector);
