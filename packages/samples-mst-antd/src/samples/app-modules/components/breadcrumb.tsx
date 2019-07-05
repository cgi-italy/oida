import React from 'react';

import { Link } from 'react-router-dom';

import { BreadcrumbItemProps } from '@oida/ui-react-core';
import { useBreadcrumb } from '@oida/ui-react-mst';
import { AntdBreadcrumb } from '@oida/ui-react-antd';

export const BreadcrumbRouterLinkItem = ({title, link}: BreadcrumbItemProps) => {
    return (
        <Link to={link || '#'}>{title}</Link>
    );
};

export const Breadcrumb = () => {
    let breadcrumbProps = useBreadcrumb();

    return (
        <AntdBreadcrumb
            {...breadcrumbProps}
            linkItem={BreadcrumbRouterLinkItem}
        />
    );
};
