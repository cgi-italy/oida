import React from 'react';
import classnames from 'classnames';

import { DataCollectionProps, DataPagerRenderer, DataSorterRenderer, DataFiltererRenderer, DataPagerProps } from '@oidajs/ui-react-core';

import { DataCollectionItemsList, DataCollectionItemsListProps } from './data-collection-items-list';
import { DataPager } from './data-pager';
import { DataSortCombo } from './data-sort-combo';
import { AdvancedSearchFilterer } from './advanced-search-filterer';

export type DataCollectionListProps<T> = {
    pagerRender?: DataPagerRenderer;
    sortRender?: DataSorterRenderer;
    filtererRender?: DataFiltererRenderer;
    className?: string;
} & DataCollectionProps<T> &
    DataCollectionItemsListProps<T>;

export const DataCollectionList = <T extends object>(props: DataCollectionListProps<T>) => {
    const { items, paging, sorting, filters, pagerRender, sortRender, filtererRender, className, ...listProps } = props;

    let dataPager: React.ReactNode;
    if (paging && paging.total > paging.pageSize) {
        if (pagerRender) {
            const Pager = pagerRender;
            dataPager = <Pager {...paging} />;
        } else {
            const size = props.size === 'large' ? undefined : props.size;
            dataPager = (
                <div className='ant-list-pagination'>
                    <DataPager size={size} {...paging} />
                </div>
            );
        }
    }

    const DataFilterer = filtererRender!;
    const DataSorter = sortRender!;

    return (
        <div className={classnames('data-collection-list', className)}>
            <div className='filter-section'>
                {filters && <DataFilterer {...filters} />}
                {sorting && <DataSorter {...sorting} />}
            </div>
            <DataCollectionItemsList<T> {...items} {...listProps}></DataCollectionItemsList>
            {dataPager}
        </div>
    );
};

DataCollectionList.defaultProps = {
    sortRender: DataSortCombo,
    filtererRender: AdvancedSearchFilterer
};
