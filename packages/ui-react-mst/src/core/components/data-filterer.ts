import React from 'react';
import { observer } from 'mobx-react';

import { IDataFilters } from '@oida/state-mst';
import { DataFiltererRenderer, AnyFormFieldDefinition } from '@oida/ui-react-core';

export type DataFiltererProps = {
    render: DataFiltererRenderer,
    state: IDataFilters
    filters: Array<AnyFormFieldDefinition>
};

export const getFiltererPropsFromState = (filters:  Array<AnyFormFieldDefinition>, state: IDataFilters) => {

    let values = new Map<string, any>();
    state.items.forEach((item) => {
        values.set(item.key, item.value);
    });

    return {
        filters: filters,
        values: values,
        onFilterChange: (name, value) => {
            if (value) {
                state.set(name, value);
            } else {
                state.unset(name);
            }
        }
    };
};

class DataFiltererBase<T> extends React.Component<DataFiltererProps> {

    render() {
        let {render, state, filters} = this.props;

        return render(getFiltererPropsFromState(filters, state));
    }
}

export const DataFilterer = observer(DataFiltererBase);
