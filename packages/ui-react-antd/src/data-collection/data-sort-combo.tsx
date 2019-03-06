import React from 'react';

import { Select, Button, Input } from 'antd';
import { SelectProps } from 'antd/lib/select';

import { SortOrder } from '@oida/core';
import { DataSorterProps } from '@oida/ui-react-core';

const Option = Select.Option;
const InputGroup = Input.Group;

export class DataSortCombo extends React.Component<SelectProps & DataSorterProps> {

    onSelectChange(value) {
        if (!value) {
            this.props.onSortClear();
        } else {
            this.props.onSortChange({key: value});
        }
    }

    switchSortOrder() {
        this.props.onSortChange({order: this.props.sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending});
    }

    render() {
        let { sortableFields, sortKey, sortOrder, ...props } = this.props;

        let options = sortableFields.map((field) => {
            return (
                <Option key={field.key} value={field.key}>{field.name}</Option>
            );
        });

        return (
            <InputGroup compact>
                <Button
                    size='small'
                    disabled={!sortKey}
                    icon={sortOrder === SortOrder.Ascending ? 'sort-ascending' : 'sort-descending'}
                    onClick={this.switchSortOrder.bind(this)}
                ></Button>
                <Select
                    {...props}
                    size='small'
                    allowClear={true}
                    showSearch={true}
                    filterOption={true}
                    value={sortKey}
                    placeholder='Sort by'
                    onChange={this.onSelectChange.bind(this)}
                >
                    {options}
                </Select>
            </InputGroup>
        );
    }
}
