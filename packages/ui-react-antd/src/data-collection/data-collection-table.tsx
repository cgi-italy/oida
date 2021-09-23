import React, { useState } from 'react';
import classnames from 'classnames';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import useResizeAware from 'react-resize-aware';
import { Table, Menu, Dropdown, Empty, ConfigProvider } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import { EllipsisOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { LoadingState, SortOrder, SelectionMode } from '@oida/core';
import { DataCollectionProps, DataPagerRenderer, DataFiltererRenderer, useScrollIntoView } from '@oida/ui-react-core';

import { DataPager } from './data-pager';
import { AdvancedSearchFilterer } from './advanced-search-filterer';
import { DataCollectionItemActionButton } from './data-collection-item-action-button';

export type DataCollectionTableColumn<T> = ColumnType<T> & {
    minTableWidth?: number
};

export type DataCollectionTableProps<T> = {
    columns: DataCollectionTableColumn<T>[]
    pagerRender?: DataPagerRenderer;
    filtererRender?: DataFiltererRenderer;
    fullHeight?: boolean;
    className?: string;
} & DataCollectionProps<T>;

export function DataCollectionTable<T extends object>(props: DataCollectionTableProps<T>) {

    const [resizeListener, size] = useResizeAware();

    const {items, paging, sorting, filters, filtererRender, pagerRender, columns} = props;

    const { itemState, itemActions } = items;

    const tableColumns = columns.filter((column) => {
        if (column.minTableWidth && size.width < column.minTableWidth) {
            return false;
        } else {
            return true;
        }
    }).map((column) => {

        let columnKey = column.key || column.dataIndex?.toString();

        let isSortable = sorting && !!sorting.sortableFields.find((field) => {
            return field.key === columnKey;
        });

        let sortOrder: 'ascend' | 'descend' | null = null;
        if (sorting && sorting.sortKey === columnKey) {
            sortOrder = sorting.sortOrder === SortOrder.Ascending ? 'ascend' : 'descend';
        }
        return {
            ...column,
            sorter: isSortable,
            sortOrder: sortOrder,
            key:  columnKey
        };
    });

    tableColumns.push({
        key: 'actions',
        render: (item, record) => {
            const actions = itemActions ? itemActions(record) : undefined;
            if (!actions) {
                return null;
            } else {
                const actionItems = actions.map((action, idx) => {
                    return (
                        <Menu.Item key={idx}>
                            <DataCollectionItemActionButton
                                action={{
                                    ...action,
                                    primary: false
                                }}
                                type='text'
                            />
                        </Menu.Item>
                    );
                });

                return (
                    <Dropdown
                        overlay={<Menu>{actionItems}</Menu>}
                        placement='bottomRight'
                        mouseEnterDelay={0.05}
                        mouseLeaveDelay={0.05}
                    >
                        <a
                            className='ant-dropdown-link'
                            onClick={e => e.preventDefault()}
                        >
                            <EllipsisOutlined/>
                        </a>
                    </Dropdown>
                );
            }
        },
        width: 40,
        sorter: undefined,
        sortOrder: null
    });

    const RowRenderer = (props) => {
        if (props.children.length) {

            const record = props.children[0].props.record;
            const { selected, hovered } = itemState(record);

            const [itemRef, setItemRef] = useState<Element | null>(null);

            useScrollIntoView({
                element: itemRef,
                scrollToElement: selected
            });

            // WARN: hooks should not be used in conditionals but we're assuming
            // that fileDropProps will not change during component lifetime
            if (items.fileDropProps) {
                const [{ canDrop, isDropHover }, drop] = useDrop({
                    accept: [NativeTypes.FILE],
                    drop: (item: {files: File[], items: DataTransferItemList, type: typeof NativeTypes.FILE}, monitor) => {
                        items.fileDropProps?.onDrop(record, item.files);
                    },
                    canDrop: () => items.fileDropProps ? items.fileDropProps.canDrop(record) : false,
                    collect: (monitor) => ({
                        isDropHover: monitor.isOver(),
                        canDrop: monitor.canDrop(),
                    })
                });

                return (
                    <tr
                        {...props}
                        ref={(element) => {
                            setItemRef(element);
                            drop(element);
                        }}
                        key={props['data-row-key']}
                        className={classnames(props.className, {
                            'hovered': hovered,
                            'selected': selected,
                            'can-drop': canDrop,
                            'is-drop-hover': isDropHover
                        })}
                    />
                );
            } else {
                return (
                    <tr
                        {...props}
                        ref={(element) => {
                            setItemRef(element);
                        }}
                        key={props['data-row-key']}
                        className={classnames(props.className, {
                            'hovered': hovered,
                            'selected': selected
                        })}
                    />
                );
            }
        } else {
            return (
                <tr
                    {...props}
                />
            );
        }
    };

    const components = {
        body: {
            row: (props) => (<RowRenderer {...props}/>)
        }
    };

    let lastClickedRowIndex = -1;

    let emptyRenderer;

    if (items.loadingState === LoadingState.Error) {
        emptyRenderer = () => (
            <Empty
                image={<CloseCircleOutlined/>}
                description='Error retrieving data'
                imageStyle={{fontSize: '30px', height: '40px'}}
            />
        );
    } else if (items.loadingState === LoadingState.Loading) {
        emptyRenderer = () => (
            <Empty
                description=''
                imageStyle={{visibility: 'hidden'}}
            />
        );
    } else {
        emptyRenderer = () => (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        );
    }

    const DataPager = pagerRender!;
    const DataFilterer = filtererRender!;

    return  (
        <ConfigProvider
                renderEmpty={emptyRenderer}
        >
            <div className={classnames('data-collection-table', props.className, {'full-height': props.fullHeight})}>
                {filters && <DataFilterer {...filters}/>}
                <div className='data-collection-table-container'>
                    {props.fullHeight && resizeListener}
                    <Table<T>
                        components={components}
                        loading={items.loadingState === LoadingState.Loading}
                        dataSource={items.data}
                        rowKey={items.keyGetter}
                        size='small'
                        onRow={(record, listIndex) => {

                            return {
                                onMouseEnter: () => {
                                    items.onHoverAction(record, true);
                                },
                                onMouseLeave: () => {
                                    items.onHoverAction(record, false);
                                },
                                onClick: (evt) => {
                                    let selectionMode = SelectionMode.Replace;
                                    if (items.multiSelect) {
                                        if (evt.ctrlKey) {
                                            selectionMode = SelectionMode.Toggle;
                                        }
                                        if (listIndex !== undefined) {
                                            if (evt.shiftKey) {
                                                selectionMode = SelectionMode.Add;
                                                if (lastClickedRowIndex !== -1) {
                                                    const startIdx = lastClickedRowIndex < listIndex
                                                        ? lastClickedRowIndex
                                                        : listIndex;
                                                    const endIdx = lastClickedRowIndex < listIndex
                                                        ? listIndex + 1
                                                        : lastClickedRowIndex + 1;
                                                    const data = items.data.slice(startIdx, endIdx);
                                                    data.forEach((item) => {
                                                        items.onSelectAction(item, selectionMode);
                                                    });
                                                    return;
                                                }
                                            } else {
                                                lastClickedRowIndex = listIndex;
                                            }
                                        }
                                    }
                                    items.onSelectAction(record, selectionMode);
                                },
                                onDoubleClick: () => {
                                    if (items.onDefaultAction) {
                                        items.onDefaultAction(record);
                                    }
                                }
                            };
                        }}
                        pagination={false}
                        columns={tableColumns}
                        onChange={(pagination, filters, sortProps) => {
                            if (sorting) {
                                if (sortProps && !Array.isArray(sortProps) && sortProps.columnKey) {
                                    if (sortProps.order) {
                                        sorting.onSortChange({
                                            key: sortProps.columnKey.toString(),
                                            order: sortProps.order === 'ascend' ? SortOrder.Ascending : SortOrder.Descending
                                        });
                                    } else {
                                        sorting.onSortClear();
                                    }
                                } else {
                                    sorting.onSortClear();
                                }
                            }
                        }}
                        scroll={props.fullHeight ? {
                            y: size.height - 40
                        } : undefined}
                    ></Table>
                </div>
                {paging && paging.total > paging.pageSize && <DataPager {...paging}/>}
            </div>
        </ConfigProvider>
    );

}

DataCollectionTable.defaultProps = {
    pagerRender: (props) => (
        <div className='ant-table-pagination ant-table-pagination-right'>
            <DataPager {...props}></DataPager>
        </div>
    ),
    filtererRender: AdvancedSearchFilterer
};
