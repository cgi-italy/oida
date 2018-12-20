import React from 'react';
import classnames from 'classnames';

import { List } from 'antd';

import { LoadingState, SelectionMode } from '@oida/core';
import { DataCollectionItemsProps } from '@oida/ui-react-core';

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
            meta,
            content,
            extra,
            onHoverAction,
            onSelectAction
        } = props;

        if (ItemHOC) {
            this.renderItem = (item: T) => (
                <ItemHOC>{() => (
                    <List.Item extra={extra && extra(item)}>
                        <span className={classnames({'hovered': isItemHovered(item), 'selected': isItemSelected(item)})}
                            onMouseEnter={() => onHoverAction(item, true)}
                            onMouseLeave={() => onHoverAction(item, false)}
                            onClick={() => onSelectAction(item, SelectionMode.Replace)}
                        >
                            {meta && (
                                <List.Item.Meta {...meta(item)}>
                                </List.Item.Meta>
                            )}
                            {content && content(item)}
                        </span>
                    </List.Item>
                )}
                </ItemHOC>
            );
        } else {
            this.renderItem = (item: T) => (
                <List.Item extra={extra && extra(item)}>
                    <span className={classnames({'hovered': isItemHovered(item), 'selected': isItemSelected(item)})}
                        onMouseEnter={() => onHoverAction(item, true)}
                        onMouseLeave={() => onHoverAction(item, false)}
                        onClick={() => onSelectAction(item, SelectionMode.Replace)}
                    >
                        {meta && (
                            <List.Item.Meta {...meta(item)}>
                            </List.Item.Meta>
                        )}
                        {content && content(item)}
                    </span>
                </List.Item>
            );
        }
    }

    render() {

        let {
            itemHOC: ItemHOC,
            isItemHovered,
            getItemKey,
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
                loading={loadingState === LoadingState.Loading}
                dataSource={data}
                renderItem={this.renderItem}
                {...props}
            />
        );
    }
}
