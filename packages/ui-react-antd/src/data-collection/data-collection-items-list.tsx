import React from 'react';

import classnames from 'classnames';

import { List, Tooltip } from 'antd';

import { LoadingState, SelectionMode } from '@oida/core';
import { DataCollectionItemsProps, canBeScrolledIntoView } from '@oida/ui-react-core';

export type DataCollectionItemsListProps<T> = {
    meta?(item: T): {avatar?: React.ReactNode, description?: React.ReactNode, title?: React.ReactNode};
    extra?(item: T): React.ReactNode;
    content?(item: T): React.ReactNode;
};

export class DataCollectionItemsList<T> extends React.Component<DataCollectionItemsListProps<T> & DataCollectionItemsProps<T>> {

    private renderItem;

    constructor(props) {
        super(props);

        let {
            itemHOC: ItemHOC,
            isItemHovered,
            getItemKey,
            isItemSelected,
            getItemIcon,
            getItemActions,
            meta,
            content,
            extra,
            onHoverAction,
            onSelectAction
        } = props;


        let renderItem = (item: T) => {

            let actions = [];
            if (getItemActions)
                actions = getItemActions(item).map((action) => {
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
                });

            let itemMeta = (
                <List.Item.Meta avatar={
                    getItemIcon &&
                    (
                        <span className='ant-avatar ant-avatar-circle ant-avatar-image'>
                            {getItemIcon(item)}
                        </span>
                    )} {...meta(item)}>
                </List.Item.Meta>
            );

            let ListItem = canBeScrolledIntoView(List.Item);

            return (
                    <ListItem
                        scrollToItem={isItemHovered(item) || isItemSelected(item)}
                        extra={extra && extra(item)}
                        actions={actions}
                        className={classnames({'hovered': isItemHovered(item), 'selected': isItemSelected(item)})}
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
                            {content ? [content(item), itemMeta] : itemMeta}
                    </ListItem>
            );
        };

        if (ItemHOC) {
            this.renderItem = (item: T) => (
                <ItemHOC>{() => renderItem(item)}</ItemHOC>
            );
        } else {
            this.renderItem = renderItem;
        }
    }

    render() {

        let {
            itemHOC: ItemHOC,
            isItemHovered,
            getItemKey,
            getItemIcon,
            getItemActions,
            isItemSelected,
            meta,
            content,
            extra,
            onHoverAction,
            onSelectAction,
            ...renderProps
        } = this.props;

        let {data, loadingState, ...props} = renderProps;

        return  (
            <List
                size='small'
                loading={loadingState === LoadingState.Loading}
                dataSource={data}
                renderItem={this.renderItem}
                {...props}
            />
        );
    }
}
