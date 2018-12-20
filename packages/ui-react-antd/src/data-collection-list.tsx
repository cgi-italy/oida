import React from 'react';

import { DataCollectionProps, DataPagerRenderer, DataSorterRenderer } from '@oida/ui-react-core';

import { DataCollectionItemsList, DataCollectionItemsListProps } from './data-collection-items-list';
import { DataPager } from './data-pager';
import { DataSortCombo } from './data-sort-combo';

export type DataCollectionListProps<T> = {
    pagerRender?: DataPagerRenderer;
    sortRender?: DataSorterRenderer;
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
        )
    };

    render() {
        let {items, paging, sorting, pagerRender, sortRender, ...listProps} = this.props;
        return  (
            <React.Fragment>
                {sortRender(sorting)}
                <DataCollectionItemsList
                    {...items}
                    {...listProps}
                ></DataCollectionItemsList>
                {pagerRender(paging)}
            </React.Fragment>
        );
    }
}

