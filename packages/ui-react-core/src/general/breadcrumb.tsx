import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb item type
 */
export type BreadcrumbItemProps = {
    /** the item key */
    key: string;
    /** the item title */
    title: string;
    /** the breadrumb internal href link */
    link?: string;
    /** custom click behaviour when no link is specified */
    onClick?: () => void;
    /**
     * custom content to render when the item is the active (last) one.
     * by default the item title is displayed as simple text
     */
    activeContent?: React.ReactNode;
};

/**
 * Common breadcrumb component properties
 */
export type BreadcrumbProps = {
    /** the breadcrumb items */
    items: BreadcrumbItemProps[];
    /** override the component used for link rendering. default to {@link BreadcrumbRouterLinkItem} */
    linkItem?: React.ComponentType<BreadcrumbItemProps>;
};

/**
 * Default breadcrumb link renderer based on react-router link
 * @param props the link properties
 */
export const BreadcrumbRouterLinkItem = (props: BreadcrumbItemProps) => {
    return <Link to={props.link || '#'}>{props.title}</Link>;
};

/**
 * Breadcrumb renderer type definition
 */
export type BreadcrumbRenderer = (props: BreadcrumbProps) => React.ReactNode;
