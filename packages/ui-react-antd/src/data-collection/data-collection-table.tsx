import React from 'react';
import classnames from 'classnames';

import { Table } from 'antd';
import { DataCollectionProps, DataPagerRenderer } from '@oida/ui-react-core';

import { LoadingState, SelectionMode, SortOrder } from '@oida/core';

import { DataPager } from './data-pager';

export type DataCollectionTableProps<T> = {
    columns
    pagerRender?: DataPagerRenderer;
} & DataCollectionProps<T>;

export class DataCollectionTable<T> extends React.Component<DataCollectionTableProps<T>> {

    static defaultProps = {
        pagerRender: (props) => (
            <div className='ant-table-pagination'>
                <DataPager {...props}></DataPager>
            </div>
        )
    };

    render() {
        let {items, paging, sorting, pagerRender, columns} = this.props;


        let tableColumns = columns.map((column) => {

            let isSortable = sorting && !!sorting.sortableFields.find((field) => {
                return field.key === column.dataIndex;
            });

            let sortOrder: string | boolean = false;
            if (sorting && sorting.sortKey === column.dataIndex) {
                sortOrder = sorting.sortOrder === SortOrder.Ascending ? 'ascend' : 'descend';
            }
            return {
                ...column,
                sorter: isSortable,
                sortOrder: sortOrder,
                key: column.dataIndex,
                dataIndex: column.dataIndex
            };
        });

        return  (
            <React.Fragment>
                <Table
                    loading={items.loadingState === LoadingState.Loading}
                    dataSource={items.data}
                    rowKey={items.getItemKey}
                    onRow={(record) => {
                        return {
                            onMouseEnter: () => {
                                items.onHoverAction(record, true);
                            },
                            onMouseLeave: () => {
                                items.onHoverAction(record, false);
                            }
                        };
                    }}
                    rowClassName={
                        (record) => classnames({
                            'selected': items.isItemSelected(record),
                            'hovered': items.isItemHovered(record)
                        })
                    }
                    pagination={false}
                    columns={tableColumns}
                    onChange={(pagination, filters, sortProps) => {
                        if (sorting) {
                            if (sortProps && sortProps.columnKey) {
                                sorting.onSortChange({
                                    key: sortProps.columnKey,
                                    order: sortProps.order === 'ascend' ? SortOrder.Ascending : SortOrder.Descending
                                });
                            } else {
                                sorting.onSortClear();
                            }
                        }
                    }}
                ></Table>
                {paging && pagerRender!(paging)}
            </React.Fragment>
        );
    }
}

