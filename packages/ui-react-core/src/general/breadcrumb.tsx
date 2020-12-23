import React from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbItemProps = {
    key: string;
    title: string;
    link?: string;
    onClick?: () => void;
};

export type BreadcrumbProps = {
    items: BreadcrumbItemProps[];
    linkItem?: React.ComponentType<BreadcrumbItemProps>
};

export const BreadcrumbRouterLinkItem = (props: BreadcrumbItemProps) => {
    return (
        <Link to={props.link || '#'}>{props.title}</Link>
    );
};

export type BreadcrumbRenderer = (props: BreadcrumbProps) => React.ReactNode;
