import React from 'react';

import { Pagination } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';

import { DataPagerProps } from '@oida/ui-react-core';

export const DataPager = (props: PaginationProps & DataPagerProps) => {

    let {page, pageSize, total, onPageChange, onPageSizeChange, ...renderProps} = props;

    return (
        <Pagination
            size='small'
            current={page + 1}
            pageSize={pageSize}
            total={total}
            onChange={(page, pageSize) => {
                onPageChange(page - 1);
            }}
            onShowSizeChange={(page, size) => {
                onPageSizeChange(size);
            }}
            {...renderProps}
        ></Pagination>
    );

};
