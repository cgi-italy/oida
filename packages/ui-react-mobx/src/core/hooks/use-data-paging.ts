import { DataPaging } from '@oida/state-mobx';
import { DataPagerProps } from '@oida/ui-react-core';

import { useSelector } from './use-selector';

export const useDataPaging = (state?: DataPaging) => {
    return useSelector(() => {
        if (!state) {
            return;
        }
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
    }, [state]);
};
