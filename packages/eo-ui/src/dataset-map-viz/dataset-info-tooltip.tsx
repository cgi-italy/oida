import React from 'react';

import { Tooltip, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export type DatasetInfoTooltipProps = {
    info?: string
};

export const DatasetInfoTooltip = (props: DatasetInfoTooltipProps) => {
    if (props.info) {
        return (
            <Tooltip
                title={props.info}
                className='info-tooltip'
            >
                <Button type='link' size='small'>
                    <InfoCircleOutlined/>
                </Button>
            </Tooltip>
        );
    } else {
        return null;
    }
};
