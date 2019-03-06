import React from 'react';

import { Breadcrumb } from 'antd';

import { BreadcrumbProps } from '@oida/ui-react-core';

export class AntdBreadcrumb extends React.Component<BreadcrumbProps> {

    render() {

        let { items, linkItem: LinkItem } = this.props;

        let breadcrumbItems = items.map((item, idx) => {
            return (
                <Breadcrumb.Item key={item.key}>
                    {idx !== items.length - 1 ? <LinkItem {...item}></LinkItem> : item.title}
                </Breadcrumb.Item>
            );
        });

        return (
            <Breadcrumb>
                {breadcrumbItems}
            </Breadcrumb>
        );
    }
}
