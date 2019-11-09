import React from 'react';

import { Select, Button, Input } from 'antd';
import { SelectProps } from 'antd/lib/select';

import { SortOrder } from '@oida/core';
import { DataSorterProps } from '@oida/ui-react-core';

const Option = Select.Option;
const InputGroup = Input.Group;

export const DataSortCombo = (props: SelectProps & DataSorterProps) => {

    const onSelectChange = (value) => {
        if (!value) {
            props.onSortClear();
        } else {
            props.onSortChange({key: value});
        }
    };

    const switchSortOrder = () => {
        props.onSortChange({order: props.sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending});
    };

    let { sortableFields, sortKey, sortOrder, ...selectProps } = props;

    let options = sortableFields.map((field) => {
        return (
            <Option key={field.key} value={field.key}>{field.name}</Option>
        );
    });

    return (
        <InputGroup compact>
            <Select
                {...selectProps}
                size='small'
                allowClear={true}
                showSearch={true}
                filterOption={true}
                value={sortKey}
                placeholder='Sort by'
                onChange={onSelectChange}
            >
                {options}
            </Select>
            <Button
                size='small'
                disabled={!sortKey}
                icon={sortOrder === SortOrder.Ascending ? 'sort-ascending' : 'sort-descending'}
                onClick={switchSortOrder}
            ></Button>
        </InputGroup>
    );
};

