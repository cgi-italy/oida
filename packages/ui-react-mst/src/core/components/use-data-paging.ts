import { useObserver } from 'mobx-react';

import { IDataPaging } from '@oida/state-mst';
import { DataPagerProps } from '@oida/ui-react-core';

export const useDataPaging = (state: IDataPaging) => {
    return useObserver(() => {
        return {
            pageSize: state.pageSize,
            page: state.page,
            total: state.total,
            onPageChange: (page) => {
                state.setPage(page);
            },
            onPageSizeChange: (pageSize) => {
                state.setPageSize(pageSize);
            }
        } as DataPagerProps;
    });
};
