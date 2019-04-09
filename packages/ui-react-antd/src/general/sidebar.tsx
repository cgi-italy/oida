import React from 'react';
import classnames from 'classnames';

import { Tabs, Tooltip } from 'antd';

import { ComponentSelectorProps } from '@oida/ui-react-core';

const TabPane = Tabs.TabPane;

export type SidebarProps = ComponentSelectorProps & {
    isRight?: boolean;
    isBottom?: boolean;
};

export class SideBar extends React.Component<SidebarProps> {
    render() {

        let {components, activeChild, onChildActivation, isRight, isBottom} = this.props;

        let panes = components.map((component) => {
            return (
                <TabPane
                    tab={<Tooltip placement='right' title={component.title}>{component.icon}</Tooltip>}
                    key={component.id}
                >
                    <div className='side-component-title'>{component.title}</div>
                    <div className='side-component-content'>{(component.id === activeChild) && component.content}</div>
                </TabPane>
            );
        });

        return (
            <Tabs className={classnames('sidebar', {'active': !!activeChild, 'is-right': isRight, 'is-bottom': isBottom})}
                tabPosition={'left'}
                activeKey={activeChild}
                onChange={
                    (activeKey) => {
                        onChildActivation(activeKey);
                    }
                }
                onTabClick={
                    (key) => {
                        if (key === activeChild) {
                            onChildActivation(null);
                        }
                    }
                }
            >
                {panes}
            </Tabs>
        );
    }
}

