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

export function DataCollectionTable<T>(props: DataCollectionTableProps<T>) {

    let {items, paging, sorting, pagerRender, columns} = props;

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
            key: column.dataIndex
        };
    });

    let itemSelector = items.itemSelector;

    let RowRenderer = (props) => {
        let record = props.children[0].props.record;

        let { selected, hovered } = itemSelector(record);

        return (
            <tr
                {...props}
                className={classnames(props.className, {'hovered': hovered, 'selected': selected})}
            />
        );
    };

    let components = {
        body: {
            row: (props) => (<RowRenderer {...props}/>)
        }
    };

    return  (
        <React.Fragment>
            <Table
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

DataCollectionTable.defaultProps = {
    pagerRender: (props) => (
        <div className='ant-table-pagination'>
            <DataPager {...props}></DataPager>
        </div>
    )
};
