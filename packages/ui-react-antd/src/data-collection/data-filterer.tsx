import React from 'react';

import { Form } from 'antd';

import { DataFiltererProps, FormFieldConfig } from '@oida/ui-react-core';
import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';

export class DataFilterer extends React.Component<DataFiltererProps> {

    onFieldChange(name, value) {
        this.props.onFilterChange(name, value);
    }

    render() {
        let filters = this.props.filters.map((filterProps) => {

            let {rendererConfig = {id: undefined, props: {}}, ...filter} = filterProps;

            let filterRenderer = antdFormFieldRendererFactory.getRenderer(filterProps);

            return (
                filterRenderer && <div key={filter.name} className='ant-form-item'>
                    {filter.title && <div className='ant-form-item-label'>
                        <label>{filter.title}</label>
                    </div>}
                    <div className='ant-form-item-control-wrapper'>
                        <div className='ant-form-item-control'>
                            {
                                filterRenderer({
                                    ...(filter as FormFieldConfig<string, any>),
                                    ...rendererConfig.props,
                                    onChange: this.onFieldChange.bind(this, filter.name),
                                    value: this.props.values.get(filter.name)
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div className='antd-data-filterer ant-form ant-form-inline'>
                {filters}
            </div>
        );
    }
}
