import React from 'react';
import classnames from 'classnames';

import { Collapse, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import { DataCollectionProps, DataPagerRenderer, DataSorterRenderer, DataFiltererRenderer } from '@oida/ui-react-core';

import { DataCollectionItemsList, DataCollectionItemsListProps } from './data-collection-items-list';
import { DataPager } from './data-pager';
import { DataSortCombo } from './data-sort-combo';
import { DataFilterer } from './data-filterer';

export type DataCollectionListProps<T> = {
    pagerRender?: DataPagerRenderer;
    sortRender?: DataSorterRenderer;
    filtererRender?: DataFiltererRenderer;
    className?: string;
} & DataCollectionProps<T> & DataCollectionItemsListProps<T>;

export class DataCollectionList<T> extends React.Component<DataCollectionListProps<T>> {

    static defaultProps = {
        pagerRender: (props) => (
            <div className='ant-list-pagination'>
                <DataPager {...props}></DataPager>
            </div>
        ),
        sortRender: (props) => (
            <DataSortCombo style={{width: '150px'}} {...props}></DataSortCombo>
        ),
        filtererRender: (props) => (
            <Collapse destroyInactivePanel={true}>
                <Collapse.Panel key='filter' header={<Button size='small'><FilterOutlined/></Button>} showArrow={false}>
                    <DataFilterer {...props}></DataFilterer>
                </Collapse.Panel>
            </Collapse>
        )
    };

    render() {
        let {items, paging, sorting, filters, pagerRender, sortRender, filtererRender, className, ...listProps} = this.props;
        return  (
            <div className={classnames('data-collection-list', className)}>
                <div className='filter-section'>
                    {sorting && sortRender!(sorting)}
                    {filters && filtererRender!(filters)}
                </div>
                <DataCollectionItemsList<T>
                    {...items}
                    {...listProps}
                ></DataCollectionItemsList>
                {paging && pagerRender!(paging)}
            </div>
        );
    }
}

