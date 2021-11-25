import React from 'react';
import { ButtonProps, Tooltip } from 'antd';

import { DataCollectionItemAction } from '@oida/ui-react-core';

import { AsyncButton } from '../general';


export type DataCollectionItemActionButtonProps = {
    action: DataCollectionItemAction;
} & Omit<ButtonProps, 'loading' | 'icon' | 'disabled' | 'href' | 'onClick'>;

export const DataCollectionItemActionButton = (props: DataCollectionItemActionButtonProps) => {

    const { action, ...buttonProps } = props;

    return (
        <AsyncButton
            size='small'
            className='data-collection-item-action-btn'
            tooltip={props.action.title || props.action.content}
            onClick={(evt) => {
                evt.stopPropagation();
                return action.callback();
            }}
            icon={action.icon}
            {...buttonProps}
            type={props.action.primary ? 'primary' : (props.type || 'link')}
        >
            {action.content && <span className='action-content'>{action.content}</span>}
        </AsyncButton>
    );
};
