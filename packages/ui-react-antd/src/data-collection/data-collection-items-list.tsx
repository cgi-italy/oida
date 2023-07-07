import React, { useState } from 'react';
import classnames from 'classnames';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { List, Empty } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { LoadingState, SelectionMode } from '@oidajs/core';
import { DataCollectionItemsProps, DataCollectionItemState, DataCollectionItemAction, useScrollIntoView } from '@oidajs/ui-react-core';

import { DataCollectionItemActionButton } from './data-collection-item-action-button';

type ListItemProps<T> = {
    item: T;
    itemState: (item: T) => DataCollectionItemState;
    itemActions?: (item: T) => DataCollectionItemAction[];
    content: (item: T) => React.ReactNode;
    onMouseEnter?: (evt: React.MouseEvent) => void;
    onMouseLeave?: (evt: React.MouseEvent) => void;
    onClick?: (evt: React.MouseEvent) => void;
    onDoubleClick?: (evt: React.MouseEvent) => void;
    fileDropProps?: {
        canDrop: (item: T) => boolean;
        onDrop: (item: T, files: File[]) => void;
    };
    scrollOnSelection?: boolean;
    size?: 'small' | 'middle' | 'large';
};

function ListItem<T>(props: ListItemProps<T>) {
    const { hovered, selected } = props.itemState(props.item);
    const actions = props.itemActions ? props.itemActions(props.item) : [];

    const itemActions = actions.map((action) => {
        return <DataCollectionItemActionButton action={action} size={props.size} />;
    });

    const [{ canDrop, isDropHover }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: (dropItem: { files: File[]; items: DataTransferItemList; type: typeof NativeTypes.FILE }, monitor) => {
            props.fileDropProps?.onDrop(props.item, dropItem.files);
        },
        canDrop: () => (props.fileDropProps ? props.fileDropProps.canDrop(props.item) : false),
        collect: (monitor) => ({
            isDropHover: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    });

    const [itemRef, setItemRef] = useState<Element | null>(null);

    useScrollIntoView({
        element: itemRef,
        scrollToElement: selected
    });

    return (
        <div
            className='list-item-wrapper'
            ref={(element) => {
                setItemRef(element);
                drop(element);
            }}
        >
            <List.Item
                actions={itemActions}
                className={classnames({ hovered: hovered, selected: selected, 'can-drop': canDrop, 'is-drop-hover': isDropHover })}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
                onClick={props.onClick}
                onDoubleClick={props.onDoubleClick}
            >
                {props.content(props.item)}
            </List.Item>
        </div>
    );
}

export type DataCollectionItemsListProps<T> = {
    disableSelection?: boolean;
    autoScrollOnSelection?: boolean;
    content: (item: T) => React.ReactNode;
    itemLayout?: 'horizontal' | 'vertical';
    size?: 'default' | 'small' | 'large';
};
export function DataCollectionItemsList<T>(props: DataCollectionItemsListProps<T> & DataCollectionItemsProps<T>) {
    const {
        autoScrollOnSelection,
        disableSelection,
        content,
        itemState,
        onHoverAction,
        onSelectAction,
        onDefaultAction,
        itemActions,
        fileDropProps,
        multiSelect,
        keyGetter,
        ...renderProps
    } = props;

    let lastClickedRowIndex = -1;

    const itemRenderer = (item, listIndex) => {
        return (
            <ListItem<T>
                item={item}
                itemState={itemState}
                itemActions={itemActions}
                content={content}
                onMouseEnter={() => onHoverAction(item, true)}
                onMouseLeave={() => {
                    onHoverAction(item, false);
                }}
                size={!props.size || props.size === 'default' ? 'middle' : props.size}
                onClick={
                    !disableSelection
                        ? (evt) => {
                              let selectionMode = SelectionMode.Replace;
                              if (multiSelect) {
                                  if (evt.ctrlKey) {
                                      selectionMode = SelectionMode.Toggle;
                                  }
                                  if (evt.shiftKey) {
                                      selectionMode = SelectionMode.Add;
                                      if (lastClickedRowIndex !== -1) {
                                          const startIdx = lastClickedRowIndex < listIndex ? lastClickedRowIndex : listIndex;
                                          const endIdx = lastClickedRowIndex < listIndex ? listIndex + 1 : lastClickedRowIndex + 1;
                                          const items = data.slice(startIdx, endIdx);
                                          items.forEach((item) => {
                                              onSelectAction(item, selectionMode);
                                          });
                                          return;
                                      }
                                  } else {
                                      lastClickedRowIndex = listIndex;
                                  }
                              }
                              onSelectAction(item, selectionMode);
                          }
                        : undefined
                }
                onDoubleClick={(evt) => {
                    if (onDefaultAction) {
                        onDefaultAction(item);
                    }
                }}
                fileDropProps={fileDropProps}
            />
        );
    };

    const { data, loadingState, ...listProps } = renderProps;

    if (loadingState === LoadingState.Error) {
        return (
            <Empty image={<CloseCircleOutlined />} description='Error retrieving data' imageStyle={{ fontSize: '30px', height: '40px' }} />
        );
    }
    if (loadingState === LoadingState.Success && !data.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    } else {
        return (
            <List
                className='data-collection-list-items'
                size={props.size || 'small'}
                loading={loadingState === LoadingState.Loading}
                rowKey={keyGetter}
                dataSource={props.data}
                renderItem={itemRenderer}
                {...listProps}
            />
        );
    }
}

DataCollectionItemsList.defaultProps = {
    autoScrollOnSelection: false
};
