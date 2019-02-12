import React from 'react';

import { Input } from 'antd';

import { StringField, STRING_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type InputFieldRendererProps = {
    prefix?: React.ReactNode,
    suffix?: React.ReactNode,
    addonBefore?: React.ReactNode,
    addonAfter?: React.ReactNode,
    changeDelay?: number
};

export class InputFieldRenderer extends React.Component<StringField & InputFieldRendererProps, any> {

    static defaultProps = {
        changeDelay: 1000
    };

    private debounceTimeout_ = null;

    constructor(props) {
        super(props);

        this.state = {
            inputValue: props.value
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.setState({
                inputValue: this.props.value
            });
        }
    }

    onInputChange(evt) {

        this.setState({
            inputValue: evt.target.value
        });

        if (this.debounceTimeout_) {
            clearTimeout(this.debounceTimeout_);
        }

        if (this.props.changeDelay) {
            this.debounceTimeout_ = setTimeout(() => {
            this.props.onChange(this.state.inputValue);
                this.debounceTimeout_ = null;
            }, this.props.changeDelay);
        } else {
            this.props.onChange(this.state.inputValue);
        }
    }

    onEnterPress() {
        if (this.debounceTimeout_) {
            clearTimeout(this.debounceTimeout_);
            this.debounceTimeout_ = null;
        }
        this.props.onChange(this.state.inputValue);
    }

    render() {

        let { value, onChange, ...renderProps } = this.props;

         return (
            <Input
                size='small'
                value={this.state.inputValue}
                onPressEnter={this.onEnterPress.bind(this)}
                onChange={this.onInputChange.bind(this)}
                {...renderProps}
            >
            </Input>
        );
    }
}

antdFormFieldRendererFactory.register<StringField>(
    STRING_FIELD_ID, 'input',
    (props) => <InputFieldRenderer {...props}></InputFieldRenderer>
);
