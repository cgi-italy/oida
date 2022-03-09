import React from 'react';
import classnames from 'classnames';

import { Tabs, Tooltip } from 'antd';

import { LayoutSectionProps } from '@oidajs/ui-react-core';

const TabPane = Tabs.TabPane;

export type SidebarProps = LayoutSectionProps & {
    isRight?: boolean;
    isBottom?: boolean;
};

export const SideBar = (props: SidebarProps) => {
    const { components, activeComponent, showComponent, isRight, isBottom } = props;

    const panes = components.map((component) => {
        return (
            <TabPane
                tab={
                    <Tooltip placement='right' title={component.title}>
                        {component.icon as React.ReactElement}
                    </Tooltip>
                }
                key={component.id}
            >
                <div className='side-component-title'>{component.title}</div>
                <div className='side-component-content'>{component.id === activeComponent && component.content}</div>
            </TabPane>
        );
    });

    return (
        <Tabs
            className={classnames('sidebar', { active: !!activeComponent, 'is-right': isRight, 'is-bottom': isBottom })}
            tabPosition={'left'}
            activeKey={activeComponent}
            onChange={(activeKey) => {
                showComponent(activeKey);
            }}
            onTabClick={(key) => {
                if (key === activeComponent) {
                    showComponent(undefined);
                }
            }}
        >
            {panes}
        </Tabs>
    );
};
