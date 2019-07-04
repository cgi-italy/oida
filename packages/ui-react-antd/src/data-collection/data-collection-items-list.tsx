import React from 'react';

import classnames from 'classnames';

import { List, Tooltip } from 'antd';

import { LoadingState, SelectionMode } from '@oida/core';
import { DataCollectionItemsProps, canBeScrolledIntoView } from '@oida/ui-react-core';

export type DataCollectionItemsListProps<T> = {
    autoScrollOnSelection?: boolean;
    meta: (item: T) => {avatar?: React.ReactNode, description?: React.ReactNode, title?: React.ReactNode};
    extra?: (item: T) => React.ReactNode;
    content?: (item: T) => React.ReactNode;
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

        let itemMeta = (
            <List.Item.Meta avatar={
                icon &&
                (
                    <span className='ant-avatar ant-avatar-circle ant-avatar-image'>
                        {icon}
                    </span>
                )} {...meta(item)}>
            </List.Item.Meta>
        );

        let ListItem;
        if (autoScrollOnSelection) {
            ListItem = canBeScrolledIntoView(List.Item);
        } else {
            ListItem = List.Item;
        }

        return (
                <ListItem
                    scrollToItem={hovered || selected}
                    extra={props.extra && props.extra(item)}
                    actions={actions}
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
                        {props.content ? [props.content(item), itemMeta] : itemMeta}
                </ListItem>
        );
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
