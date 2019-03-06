import React from 'react';

export type BreadcrumbItemProps = {
    key: string;
    title: string;
    link?: string;
};

export type BreadcrumbProps = {
    items: BreadcrumbItemProps[];
    linkItem: React.ComponentType<BreadcrumbItemProps>
};

export type BreadcrumbRenderer = (props: BreadcrumbProps) => React.ReactNode;
