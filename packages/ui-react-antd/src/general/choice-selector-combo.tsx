import React from 'react';

import { Select } from 'antd';

import { ChoiceSelectorProps } from '@oida/ui-react-core';

const Option = Select.Option;

export class ChoiceSelectorCombo extends React.Component<ChoiceSelectorProps> {

    onSelectChange(value) {
        if (value !== this.props.value) {
            this.props.onSelect(value);
        }
    }

    render() {

        let options = this.props.items.map((item) => {
            return (<Option key={item.value} title={item.description}>{item.name}</Option>);
        });

        return (
            <Select
                onSelect={this.onSelectChange.bind(this)}
                value={this.props.value}
            >
                {options}
            </Select>
        );
    }
}
