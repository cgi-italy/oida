import React from 'react';
import classnames from 'classnames';

import { DataCollectionProps, DataPagerRenderer, DataSorterRenderer, DataFiltererRenderer } from '@oida/ui-react-core';

import { DataCollectionItemsList, DataCollectionItemsListProps } from './data-collection-items-list';
import { DataPager } from './data-pager';
import { DataSortCombo } from './data-sort-combo';
import { AdvancedSearchFilterer } from './advanced-search-filterer';

export type DataCollectionListProps<T> = {
    pagerRender?: DataPagerRenderer;
    sortRender?: DataSorterRenderer;
    filtererRender?: DataFiltererRenderer;
    className?: string;
} & DataCollectionProps<T> & DataCollectionItemsListProps<T>;

export const DataCollectionList = <T extends Object>(props: DataCollectionListProps<T>) => {
    const {items, paging, sorting, filters, pagerRender, sortRender, filtererRender, className, ...listProps} = props;

    const DataPager = pagerRender!;
    const DataFilterer = filtererRender!;
    const DataSorter = sortRender!;

    return  (
        <div className={classnames('data-collection-list', className)}>
            <div className='filter-section'>
                {filters && <DataFilterer {...filters}/>}
                {sorting && <DataSorter {...sorting}/>}
            </div>
            <DataCollectionItemsList<T>
                {...items}
                {...listProps}
            ></DataCollectionItemsList>
            {paging && paging.total > paging.pageSize && <DataPager {...paging}/>}
        </div>
    );
};

DataCollectionList.defaultProps = {
    pagerRender: (props) => (
        <div className='ant-list-pagination'>
            <DataPager {...props}></DataPager>
        </div>
    ),
    sortRender: DataSortCombo,
    filtererRender: AdvancedSearchFilterer
};
