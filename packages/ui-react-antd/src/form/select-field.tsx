import React from 'react';

import { Select } from 'antd';

import { EnumField, ENUM_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

const Option = Select.Option;

export class SelectEnumRenderer extends React.Component<EnumField> {

    onSelectChange(value) {
        if (!value || (Array.isArray(value) && !value.length)) {
            this.props.onChange(undefined);
        } else {
            this.props.onChange(value);
        }
    }

    render() {

        let options = this.props.config.choices.map((choice) => {
            return <Option key={choice.value} value={choice.value}>{choice.name}</Option>;
        });

        return (
            <Select
                size='small'
                style={{minWidth: '150px', width: '100%'}}
                value={this.props.value}
                onChange={this.onSelectChange.bind(this)}
                allowClear={!this.props.required}
                mode={this.props.config.multiple ? 'multiple' : 'default'}
            >
                {options}
            </Select>
        );
    }
}

antdFormFieldRendererFactory.register<EnumField>(
    ENUM_FIELD_ID, 'select',
    (props) => <SelectEnumRenderer {...props}></SelectEnumRenderer>
);
