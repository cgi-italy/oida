import React from 'react';

import { Select } from 'antd';

import { ChoiceSelectorProps } from '@oidajs/ui-react-core';

const Option = Select.Option;

export class ChoiceSelectorCombo extends React.Component<
    ChoiceSelectorProps<{
        itemContent?: React.ReactNode;
    }>
> {
    onSelectChange(value) {
        if (value !== this.props.value) {
            this.props.onSelect(value);
        }
    }

    render() {
        const options = this.props.items.map((item) => {
            return (
                <Option key={item.value} value={item.value} title={item.description}>
                    {item.itemContent ? item.itemContent : item.name}
                </Option>
            );
        });

        return (
            <Select onSelect={this.onSelectChange.bind(this)} value={this.props.value}>
                {options}
            </Select>
        );
    }
}
