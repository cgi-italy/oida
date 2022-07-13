import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export type TooltipIconProps = {
    title: React.ReactNode;
    icon?: React.ReactNode;
};
export const TooltipIcon = (props: TooltipIconProps) => {
    const icon = props.icon || <QuestionCircleOutlined />;
    return (
        <Tooltip className='tooltip-icon' title={props.title}>
            {icon}
        </Tooltip>
    );
};
