import React from 'react';

import { DataFiltererProps } from '@oida/ui-react-core';

import { FormRenderer } from '../form';


export const DataFilterer = (props: DataFiltererProps) => {

    return (
        <FormRenderer
            fields={props.filters}
            values={props.values}
            onFieldChange={props.onFilterChange}
            className='antd-data-filterer'
        />
    );

};
