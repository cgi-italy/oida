import React, { useMemo } from 'react';
import { Menu, Divider } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { MenuItemType, SubMenuType } from 'antd/es/menu/hooks/useItems';

export type AppHeaderNavItem = {
    id: string;
    title: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    subitems?: AppHeaderNavItem[];
    href?: {
        src: string;
        target?: string;
    };
};

export type AppHeaderProps = {
    appTitle: React.ReactNode;
    logoUrl: string;
    onTitleClick?: () => void;
    menuItems?: AppHeaderNavItem[];
    selectedMenuItem?: string;
    extraContent?: React.ReactNode;
};

const getMenuElement = (item: AppHeaderNavItem): SubMenuType | MenuItemType => {
    if (item.subitems && item.subitems.length) {
        const subItems = item.subitems.map((item) => {
            return getMenuElement(item);
        });

        const content = item.href ? (
            <a href={item.href.src} target={item.href.target || '_blank'}>
                {item.title}
            </a>
        ) : (
            <span>{item.title}</span>
        );

        return {
            key: item.id,
            icon: item.icon,
            onTitleClick: item.onClick,
            title: (
                <React.Fragment>
                    <span>{content}</span>
                    <DownOutlined />
                </React.Fragment>
            ),
            popupClassName: 'app-header-menu-popup',
            label: (
                <React.Fragment>
                    <span>{content}</span>
                    <DownOutlined />
                </React.Fragment>
            ),
            children: subItems
        } as SubMenuType;
    } else {
        const content = item.href ? (
            <a href={item.href.src} target={item.href.target || '_blank'}>
                {item.title}
            </a>
        ) : (
            item.title
        );
        return {
            key: item.id,
            icon: item.icon,
            onClick: item.onClick,
            label: content
        } as MenuItemType;
    }
};

export const AppHeader = (props: AppHeaderProps) => {
    const menuItems = useMemo(() => {
        if (props.menuItems && props.menuItems.length) {
            return props.menuItems.map((item) => {
                return getMenuElement(item);
            });
        } else {
            return undefined;
        }
    }, [props.menuItems]);

    return (
        <div className='app-header'>
            <div className={classnames('app-header-brand', { 'is-clickable': !!props.onTitleClick })} onClick={props.onTitleClick}>
                <div className='app-header-logo'>
                    <img src={props.logoUrl}></img>
                </div>
                <div className='app-header-title'>{props.appTitle}</div>
            </div>
            <Divider type='vertical' />
            <Menu
                className='app-header-menu'
                mode='horizontal'
                selectedKeys={props.selectedMenuItem ? [props.selectedMenuItem] : undefined}
                items={menuItems}
            />
            <div className='app-header-extra'>{props.extraContent}</div>
        </div>
    );
};
