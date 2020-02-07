import React from 'react';

import { DataFiltererProps, useFormFieldRenderers } from '@oida/ui-react-core';
import { antdFormFieldRendererFactory } from '../form/antd-form-field-renderer-factory';

export const FilterWrapper = (props) => {

    let { title, children } = props;
    return (
        <div className='ant-form-item'>
            {title && <div className='ant-form-item-label'>
                <label>{title}</label>
            </div>}
            <div className='ant-form-item-control-wrapper'>
                <div className='ant-form-item-control'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export const DataFilterer = (props: DataFiltererProps) => {

    const filtersConfig = useFormFieldRenderers({
        filters: props.filters,
        factory: antdFormFieldRendererFactory
    });

    const filters = filtersConfig.map((config) => {
        if (config) {
            let { FilterRenderer, renderProps } = config;
            return (
                <FilterWrapper key={renderProps.name} {...renderProps}>
                    <FilterRenderer
                        {...renderProps}
                        value={props.values.get(renderProps.name)}
                        onChange={ (value) => props.onFilterChange(renderProps.name, value)}
                    />
                </FilterWrapper>
            );
        }
    });

    return (
        <div className='antd-data-filterer ant-form'>
            {filters}
        </div>
    );

};
