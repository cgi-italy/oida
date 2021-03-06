import React from 'react';
import { Breadcrumb } from 'antd';

import { BreadcrumbProps, BreadcrumbRouterLinkItem } from '@oidajs/ui-react-core';

/**
 * A breadcrumb renderer
 * @param props
 */
export const AntdBreadcrumb = (props: BreadcrumbProps) => {
    const { items } = props;
    const LinkItem = props.linkItem || BreadcrumbRouterLinkItem;

    const breadcrumbItems = items.map((item, idx) => {
        return (
            <Breadcrumb.Item key={item.key}>
                {idx !== items.length - 1 ? (
                    item.onClick ? (
                        <a onClick={item.onClick}>{item.title}</a>
                    ) : (
                        <LinkItem {...item}></LinkItem>
                    )
                ) : item.activeContent ? (
                    item.activeContent
                ) : (
                    item.title
                )}
            </Breadcrumb.Item>
        );
    });

    return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
};
