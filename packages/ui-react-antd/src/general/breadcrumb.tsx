import React from 'react';
import { Breadcrumb } from 'antd';

import { BreadcrumbProps, BreadcrumbRouterLinkItem } from '@oida/ui-react-core';

export const AntdBreadcrumb = (props: BreadcrumbProps) => {

    let { items } = props;
    const LinkItem = props.linkItem || BreadcrumbRouterLinkItem;

    let breadcrumbItems = items.map((item, idx) => {
        return (
            <Breadcrumb.Item key={item.key}>
                {idx !== items.length - 1
                    ? (item.onClick ? <a onClick={item.onClick}>{item.title}</a> : <LinkItem {...item}></LinkItem>)
                    : item.title
                }
            </Breadcrumb.Item>
        );
    });

    return (
        <Breadcrumb>
            {breadcrumbItems}
        </Breadcrumb>
    );
};
