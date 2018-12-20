import React from 'react';

import { Pagination } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';

import { DataPagerProps } from '@oida/ui-react-core';

export class DataPager extends React.Component<PaginationProps & DataPagerProps> {
    render() {

        let {page, pageSize, total, onPageChange, onPageSizeChange, ...props} = this.props;

        return (
            <Pagination
                current={page + 1}
                pageSize={pageSize}
                total={total}
                onChange={(page, pageSize) => {
                    onPageChange(page - 1);
                }}
                onShowSizeChange={(page, size) => {
                    onPageSizeChange(size);
                }}
                {...props}
            ></Pagination>
        );
    }
}
