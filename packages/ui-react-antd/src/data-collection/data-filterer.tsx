import React from 'react';

import { DataFiltererProps } from '@oidajs/ui-react-core';

import { DataForm } from '../form';

export const DataFilterer = (props: DataFiltererProps) => {
    return <DataForm className='antd-data-filterer' {...props} />;
};
