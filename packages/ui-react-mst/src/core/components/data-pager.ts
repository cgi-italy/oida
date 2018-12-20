import React from 'react';
import { observer } from 'mobx-react';

import { IDataPaging } from '@oida/state-mst';
import { DataPagerRenderer } from '@oida/ui-react-core';

export type DataPagerProps = {
    render: DataPagerRenderer,
    state: IDataPaging
};

export const getPagerPropsFromState = (state: IDataPaging) => {
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
    };
};

class DataPagerBase extends React.Component<DataPagerProps> {

    render() {
        let {render, state} = this.props;

        return render(getPagerPropsFromState(state));
    }
}

export const DataPager = observer(DataPagerBase);
