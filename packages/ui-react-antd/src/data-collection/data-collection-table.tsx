import React, { useState } from 'react';
import classnames from 'classnames';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import useDimensions from 'react-cool-dimensions';
import { Table, Dropdown, Empty, ConfigProvider, MenuProps, TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import { EllipsisOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { LoadingState, SortOrder, SelectionMode } from '@oidajs/core';
import {
    DataCollectionProps,
    DataPagerRenderer,
    DataFiltererRenderer,
    useScrollIntoView,
    DataCollectionItemAction
} from '@oidajs/ui-react-core';

import { DataPager } from './data-pager';
import { DropdownFilterer } from './dropdown-filterer';
import { DataCollectionItemActionButton } from './data-collection-item-action-button';

type DataCollectionTableItemActionsProps<T> = {
    itemActions: (item: T) => DataCollectionItemAction[];
    item: T;
    expandActions?: boolean;
};

const DataCollectionTableItemActions = <T extends object>(props: DataCollectionTableItemActionsProps<T>) => {
    const actions = props.itemActions(props.item);

    if (!actions.length) {
        return null;
    }
    if (props.expandActions) {
        const actionItems = actions.map((action, idx) => {
            return <DataCollectionItemActionButton key={idx} action={action} />;
        });

        return <div className='table-item-actions'>{actionItems}</div>;
    } else {
        const actionItems: MenuProps['items'] = actions.map((action, idx) => {
            return {
                key: idx,
                label: (
                    <DataCollectionItemActionButton
                        action={{
                            ...action,
                            primary: false
                        }}
                        type='text'
                    />
                )
            };
        });

        return (
            <Dropdown
                menu={{ items: actionItems }}
                placement='bottomRight'
                mouseEnterDelay={0.05}
                mouseLeaveDelay={0.05}
                overlayClassName='data-collection-table-item-actions-menu'
            >
                <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                    <EllipsisOutlined />
                </a>
            </Dropdown>
        );
    }
};

export type DataCollectionTableColumn<T> = ColumnType<T> & {
    minTableWidth?: number;
};

export type DataCollectionTableProps<T> = {
    columns: DataCollectionTableColumn<T>[];
    pagerRender?: DataPagerRenderer;
    filtererRender?: DataFiltererRenderer;
    fullHeight?: boolean;
    className?: string;
    expandActions?: boolean;
    extraHeaderContent?: React.ReactNode;
} & DataCollectionProps<T> &
    Omit<TableProps<T>, 'pagination' | 'components' | 'dataSource' | 'loading' | 'onRow' | 'rowKey' | 'columns' | 'onChange' | 'scroll'>;

export function DataCollectionTable<T extends object>(props: DataCollectionTableProps<T>) {
    const { observe, width, height } = useDimensions();

    const {
        items,
        paging,
        sorting,
        filters,
        filtererRender,
        pagerRender,
        columns,
        className,
        fullHeight,
        expandActions,
        extraHeaderContent,
        ...tableProps
    } = props;

    const { itemState, itemActions } = items;

    const tableColumns = columns
        .filter((column) => {
            if (column.minTableWidth && (width || 0) < column.minTableWidth) {
                return false;
            } else {
                return true;
            }
        })
        .map((column) => {
            const columnKey = column.key || column.dataIndex?.toString();

            const isSortable =
                sorting &&
                !!sorting.sortableFields.find((field) => {
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
                key: columnKey
            };
        });

    if (itemActions) {
        tableColumns.push({
            key: 'actions',
            render: (item, record) => {
                return <DataCollectionTableItemActions item={record} itemActions={itemActions} expandActions={props.expandActions} />;
            },
            width: props.expandActions ? undefined : 40,
            align: 'right',
            sorter: undefined,
            sortOrder: null
        });
    }

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
                    drop: (item: { files: File[]; items: DataTransferItemList; type: typeof NativeTypes.FILE }, monitor) => {
                        items.fileDropProps?.onDrop(record, item.files);
                    },
                    canDrop: () => (items.fileDropProps ? items.fileDropProps.canDrop(record) : false),
                    collect: (monitor) => ({
                        isDropHover: monitor.isOver(),
                        canDrop: monitor.canDrop()
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
                            hovered: hovered,
                            selected: selected,
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
                            hovered: hovered,
                            selected: selected
                        })}
                    />
                );
            }
        } else {
            return <tr {...props} />;
        }
    };

    const components = {
        body: {
            row: (props) => <RowRenderer {...props} />
        }
    };

    let lastClickedRowIndex = -1;

    let emptyRenderer;

    if (items.loadingState === LoadingState.Error) {
        emptyRenderer = () => (
            <Empty image={<CloseCircleOutlined />} description='Error retrieving data' imageStyle={{ fontSize: '30px', height: '40px' }} />
        );
    } else if (items.loadingState === LoadingState.Loading) {
        emptyRenderer = () => <Empty description='' imageStyle={{ visibility: 'hidden' }} />;
    } else {
        emptyRenderer = () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const DataPager = pagerRender!;
    const DataFilterer = filtererRender!;

    return (
        <ConfigProvider renderEmpty={emptyRenderer}>
            <div className={classnames('data-collection-table', props.className, { 'full-height': props.fullHeight })}>
                <div className='data-collection-table-header'>
                    {filters && <DataFilterer {...filters} />}
                    {extraHeaderContent}
                </div>
                <div className='data-collection-table-container' ref={observe}>
                    <Table<T>
                        {...tableProps}
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
                                                    const startIdx = lastClickedRowIndex < listIndex ? lastClickedRowIndex : listIndex;
                                                    const endIdx =
                                                        lastClickedRowIndex < listIndex ? listIndex + 1 : lastClickedRowIndex + 1;
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
                        scroll={
                            props.fullHeight
                                ? {
                                      y: (height || 40) - 40
                                  }
                                : undefined
                        }
                    ></Table>
                </div>
                {paging && paging.total > paging.pageSize && <DataPager {...paging} />}
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
    filtererRender: DropdownFilterer
};
