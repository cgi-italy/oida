import React, { useState, useEffect } from 'react';

import classnames from 'classnames';

import { List, Tooltip } from 'antd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import { LoadingState, SelectionMode } from '@oida/core';
import { DataCollectionItemsProps, DataCollectionItemProps, useScrollIntoView } from '@oida/ui-react-core';

type ListItemProps<T> = {
    item: T;
    itemSelector: (item: T) => DataCollectionItemProps<T>;
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
};

function ListItem<T>(props: ListItemProps<T>) {

    const {hovered, selected, actions: actions} =  props.itemSelector(props.item);

    const itemActions = actions ? actions.map((action) => {
        return (
            <Tooltip title={action.name}>
                <a onClick={
                    () => {
                        action.callback(props.item);
                }
                }>
                    {action.icon}
                    <span className='action-content'>{action.content}</span>
                </a>
            </Tooltip>
        );
    }) : undefined;

    const [{ canDrop, isDropHover }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: (dropItem: {files: File[], items: DataTransferItemList, type: typeof NativeTypes.FILE}, monitor) => {
            props.fileDropProps?.onDrop(props.item, dropItem.files);
        },
        canDrop: () => props.fileDropProps ? props.fileDropProps.canDrop(props.item) : false,
        collect: (monitor) => ({
            isDropHover: monitor.isOver(),
            canDrop: monitor.canDrop(),
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
                className={classnames({'hovered': hovered, 'selected': selected, 'can-drop': canDrop, 'is-drop-hover': isDropHover})}
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
    autoScrollOnSelection?: boolean;
    content: (item: T) => React.ReactNode;
    itemLayout?: 'horizontal' | 'vertical';
    size?: 'default' | 'small' | 'large';
};
export function DataCollectionItemsList<T>(props: DataCollectionItemsListProps<T> & DataCollectionItemsProps<T>) {

    const {
        autoScrollOnSelection,
        content,
        itemSelector,
        onHoverAction,
        onSelectAction,
        onDefaultAction,
        fileDropProps,
        multiSelect,
        keyGetter,
        ...renderProps
    } = props;

    let lastClickedRowIndex = -1;

    const listItems = props.data.map((item, listIndex) => {

        return (
            <ListItem<T>
                key={keyGetter(item)}
                item={item}
                itemSelector={itemSelector}
                content={content}
                onMouseEnter={() => onHoverAction(item, true)}
                onMouseLeave={() => {
                    onHoverAction(item, false);
                }}
                onClick={(evt) => {
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
                }}
                onDoubleClick={(evt) => {
                    if (onDefaultAction) {
                        onDefaultAction(item);
                    }
                }}
                fileDropProps={fileDropProps}
            />
        );
    });

    const {data, loadingState, ...listProps} = renderProps;

    return  (
        <List
            className='data-collection-list-items'
            size={props.size || 'small'}
            loading={loadingState === LoadingState.Loading}
            rowKey={keyGetter}
            {...listProps}
        >
            {listItems}
        </List>
    );

}

DataCollectionItemsList.defaultProps = {
    autoScrollOnSelection: false
};
