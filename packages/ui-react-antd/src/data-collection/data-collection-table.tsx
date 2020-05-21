import React from 'react';
import classnames from 'classnames';

import { Table } from 'antd';
import { DataCollectionProps, DataPagerRenderer } from '@oida/ui-react-core';

import { LoadingState, SortOrder } from '@oida/core';

import { DataPager } from './data-pager';

export type DataCollectionTableProps<T> = {
    columns
    pagerRender?: DataPagerRenderer;
} & DataCollectionProps<T>;

export function DataCollectionTable<T extends object>(props: DataCollectionTableProps<T>) {

    let {items, paging, sorting, pagerRender, columns} = props;

    let tableColumns = columns.map((column) => {

        let columnKey = column.key || column.dataIndex;

        let isSortable = sorting && !!sorting.sortableFields.find((field) => {
            return field.key === columnKey;
        });

        let sortOrder: string | boolean = false;
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

    let itemSelector = items.itemSelector;

    let RowRenderer = (props) => {
        if (props.children.length) {
            let record = props.children[0].props.record;

            let { selected, hovered } = itemSelector(record);

            return (
                <tr
                    {...props}
                    className={classnames(props.className, {'hovered': hovered, 'selected': selected})}
                />
            );
        } else {
            return (
                <tr
                    {...props}
                />
            );
        }
    };

    let components = {
        body: {
            row: (props) => (<RowRenderer {...props}/>)
        }
    };

    return  (
        <div className='data-collection-table'>
            <Table<T>
                components={components}
                loading={items.loadingState === LoadingState.Loading}
                dataSource={items.data}
                rowKey={items.keyGetter}
                size='small'
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
                pagination={false}
                columns={tableColumns}
                onChange={(pagination, filters, sortProps) => {
                    if (sorting) {
                        if (sortProps && !Array.isArray(sortProps) && sortProps.columnKey) {
                            sorting.onSortChange({
                                key: sortProps.columnKey.toString(),
                                order: sortProps.order === 'ascend' ? SortOrder.Ascending : SortOrder.Descending
                            });
                        } else {
                            sorting.onSortClear();
                        }
                    }
                }}
            ></Table>
            {paging && pagerRender!(paging)}
        </div>
    );

}

DataCollectionTable.defaultProps = {
    pagerRender: (props) => (
        <div className='ant-table-pagination'>
            <DataPager {...props}></DataPager>
        </div>
    )
};
