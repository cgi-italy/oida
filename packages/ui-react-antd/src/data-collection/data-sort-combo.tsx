import React from 'react';

import { Select, Button, Input } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

import { SortOrder } from '@oidajs/core';
import { DataSorterProps } from '@oidajs/ui-react-core';

const Option = Select.Option;
const InputGroup = Input.Group;

export const DataSortCombo = (props: SelectProps<string> & DataSorterProps) => {

    let { sortableFields, sortKey, sortOrder, onSortChange, onSortClear, ...selectProps } = props;

    const onSelectChange = (value) => {
        if (!value) {
            onSortClear();
        } else {
            onSortChange({key: value});
        }
    };

    const switchSortOrder = () => {
        onSortChange({order: sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending});
    };

    let options = sortableFields.map((field) => {
        return (
            <Option key={field.key} value={field.key}>{field.name}</Option>
        );
    });

    return (
        <InputGroup compact className='data-sort-combo'>
            <Select
                {...selectProps}
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
                size={selectProps.size}
                disabled={!sortKey}
                icon={sortOrder === SortOrder.Ascending ? <SortAscendingOutlined/> : <SortDescendingOutlined/>}
                onClick={switchSortOrder}
            ></Button>
        </InputGroup>
    );
};

