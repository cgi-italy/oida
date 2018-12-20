import React from 'react';
import { observer } from 'mobx-react';

import { IDataSorting } from '@oida/state-mst';
import { DataSortField, DataSorterRenderer } from '@oida/ui-react-core';

export type DataSorterProps = {
    render: DataSorterRenderer,
    state: IDataSorting
    fields: Array<DataSortField>
};

export const getSorterPropsFromState = (fields, state) => {
    return {
        sortableFields: fields,
        sortKey: state.key,
        sortOrder: state.order,
        onSortChange: (sortParams) => {
            state.sortBy(sortParams);
        },
        onSortClear: () => {
            state.clear();
        }
    };
};

class DataSorterBase<T> extends React.Component<DataSorterProps> {

    render() {
        let {render, state, fields} = this.props;

        return render(getSorterPropsFromState(fields, state));
    }
}

export const DataSorter = observer(DataSorterBase);
