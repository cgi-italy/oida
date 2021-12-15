import React, { useState } from 'react';
import classnames from 'classnames';

import { Tabs, Tooltip } from 'antd';

import { LayoutSectionProps } from '@oidajs/ui-react-core';

const TabPane = Tabs.TabPane;

export type SideNavProps = LayoutSectionProps & {
    logoSmall?: React.ReactNode;
    logoFull?: React.ReactNode;
    isRight?: boolean;
    extraItems?: React.ReactNode[];
    extraTopContent?: React.ReactNode;
};

export const SideNav = (props: SideNavProps) => {

    let {components, activeComponent, showComponent,
        expanded, setExpanded, isRight,
        logoSmall, logoFull, extraItems, extraTopContent
    } = props;

    let panes = components.map((component) => {
        return (
            <TabPane
                tab={<Tooltip placement='right' title={component.title}>{component.icon as React.ReactElement}</Tooltip>}
                key={component.id}
            >
                {(component.id === activeComponent) && (
                    <React.Fragment>
                        <div className='side-component-title'>{component.title}</div>
                        <div className='side-component-content'>{(component.id === activeComponent) && component.content}</div>
                    </React.Fragment>
                )}
            </TabPane>
        );
    });

    let extraContent = extraItems ? extraItems.map((item, idx) => (<div key={idx} className='action'>{item}</div>)) : undefined;

    let isActive = !!activeComponent && expanded;

    return (
        <div className={classnames('sidenav', {'active': isActive, 'is-right': isRight, 'expanded': expanded})}>
            <div className='top-bar'>
                {!expanded && logoSmall && <div className='logo logo-small'>{logoSmall}</div>}
                <React.Fragment>
                    {expanded && logoFull && <div className='logo logo-full'>{logoFull}</div>}
                    {expanded && extraTopContent && <div className='top-content'>{extraTopContent}</div>}
                </React.Fragment>
            </div>
            <Tabs
                tabBarExtraContent={extraContent}
                tabPosition={isRight ? 'right' : 'left'}
                activeKey={activeComponent}
                destroyInactiveTabPane={true}
                onChange={
                    (activeKey) => {
                        setExpanded(true);
                        showComponent(activeKey);
                    }
                }
                onTabClick={
                    (key) => {
                        if (key === activeComponent) {
                            //showComponent(undefined);
                            setExpanded(!expanded);
                        }
                    }
                }
            >
                {panes}
            </Tabs>
        </div>
    );

};

