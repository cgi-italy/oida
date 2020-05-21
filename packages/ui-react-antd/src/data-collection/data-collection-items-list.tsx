import React from 'react';

import classnames from 'classnames';

import { List, Tooltip } from 'antd';

import { LoadingState, SelectionMode } from '@oida/core';
import { DataCollectionItemsProps, CanBeScrolledIntoView } from '@oida/ui-react-core';

export type DataCollectionItemsListProps<T> = {
    autoScrollOnSelection?: boolean;
    meta?: (item: T) => {avatar?: React.ReactNode, description?: React.ReactNode, title?: React.ReactNode};
    extra?: (item: T) => React.ReactNode;
    content?: (item: T) => React.ReactNode;
    itemLayout?: 'horizontal' | 'vertical';
};


export function DataCollectionItemsList<T>(props: DataCollectionItemsListProps<T> & DataCollectionItemsProps<T>) {

    let {
        autoScrollOnSelection,
        meta,
        content,
        extra,
        itemSelector,
        onHoverAction,
        onSelectAction,
        keyGetter,
        ...renderProps
    } = props;


    let ItemRenderer = ({item}) => {

        let {hovered, selected, actions: actions, icon} =  itemSelector(item);

        let metaProps = meta ? meta(item) : {};

        let itemMeta = (
            <List.Item.Meta avatar={
                icon &&
                (
                    <span className='ant-avatar ant-avatar-circle ant-avatar-image'>
                        {icon}
                    </span>
                )} {...metaProps}>
            </List.Item.Meta>
        );

        let itemActions = actions ? actions.map((action) => {
            return (
                <Tooltip title={action.name}>
                    <a onClick={
                        () => {
                            action.callback(item);
                    }
                    }>
                        {action.icon}
                    </a>
                </Tooltip>
            );
        }) : undefined;

        let listItem = (
            <List.Item
                extra={props.extra && props.extra(item)}
                actions={itemActions}
                className={classnames({'hovered': hovered, 'selected': selected})}
                onMouseEnter={() => {
                    onHoverAction(item, true);
                }}
                onMouseLeave={() => {
                    onHoverAction(item, false);
                }}
                onClick={() => {
                    onSelectAction(item, SelectionMode.Replace);
                }}
            >
                {(icon || meta) && itemMeta}
                {props.content && props.content(item)}
            </List.Item>
        );

        let itemRenderer = listItem;
        if (autoScrollOnSelection) {
            itemRenderer = (
                <CanBeScrolledIntoView
                    scrollToItem={hovered || selected}
                >
                    {listItem}
                </CanBeScrolledIntoView>
            );
        }

        return itemRenderer;
    };

    let {data, loadingState, ...listProps} = renderProps;

    return  (
        <List
            size='small'
            loading={loadingState === LoadingState.Loading}
            dataSource={data}
            rowKey={keyGetter}
            renderItem={(item: T) => (<ItemRenderer item={item}></ItemRenderer>)} //allow usage of hooks inside ItemRenderer
            {...listProps}
        />
    );
}

DataCollectionItemsList.defaultProps = {
    autoScrollOnSelection: false
};
