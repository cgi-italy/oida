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
        let content: React.ReactNode;
        if (idx !== items.length - 1) {
            if (item.onClick) {
                content = <a onClick={item.onClick}>{item.title}</a>;
            } else {
                content = <LinkItem {...item}></LinkItem>;
            }
        } else {
            content = item.activeContent ? item.activeContent : item.title;
        }
        return {
            key: item.key,
            title: content
        };
    });

    return <Breadcrumb className='app-breadcrumb' items={breadcrumbItems} />;
};
