import React from 'react';

import { DataFiltererProps } from '@oidajs/ui-react-core';

import { DataForm } from '../form';

export const DataFilterer = (props: DataFiltererProps) => {
    const { mainFilter, ...formProps } = props;
    return <DataForm className='antd-data-filterer' size='middle' layout='horizontal' {...formProps} />;
};
