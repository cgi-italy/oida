import React from 'react';
import { Button, Menu } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import classnames from 'classnames';

export type AppNavItem = {
    id: string;
    title: string;
    icon?: React.ReactNode;
    onClick: () => void;
};

export type AppSideNavProps = {
    items: AppNavItem[];
    selectedItem?: string;
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
};

export const AppSideNav = (props: AppSideNavProps) => {
    const navItems = props.items.map((item) => {
        return (
            <Menu.Item key={item.id} onClick={item.onClick} icon={item.icon}>
                {item.title}
            </Menu.Item>
        );
    });

    const onCollapsedChange = props.onCollapsedChange;

    return (
        <div className={classnames('app-side-nav', { collapsed: props.collapsed })}>
            <Menu
                className='app-side-nav-menu'
                mode='inline'
                inlineCollapsed={props.collapsed}
                selectedKeys={props.selectedItem ? [props.selectedItem] : undefined}
            >
                {navItems}
            </Menu>
            {onCollapsedChange && (
                <Button
                    className='app-side-nav-collapse-btn'
                    type='text'
                    block={true}
                    icon={!props.collapsed ? <LeftOutlined /> : <RightOutlined />}
                    onClick={() => {
                        onCollapsedChange(!props.collapsed);
                    }}
                />
            )}
        </div>
    );
};
