import React, { useState } from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';

import { DataCollectionItemAction } from '@oida/ui-react-core';


export type DataCollectionItemActionButtonProps = {
    action: DataCollectionItemAction;
} & Omit<ButtonProps, 'loading' | 'icon' | 'disabled' | 'href' | 'onClick'>;

export const DataCollectionItemActionButton = (props: DataCollectionItemActionButtonProps) => {

    const [loading, setLoading] = useState(false);

    const { action, ...buttonProps } = props;

    return (
        <Tooltip
            title={props.action.title || props.action.content}
            className='data-collection-item-action-btn'
        >
            <Button
                size='small'
                onClick={() => {
                    const callbackReturn = action.callback();
                    if (callbackReturn) {
                        setLoading(true);
                        callbackReturn.finally(() => {
                            setLoading(false);
                        });
                    }
                }}
                icon={action.icon}
                loading={loading}
                {...buttonProps}
                type={props.action.primary ? 'primary' : (props.type || 'link')}
            >
                {action.content && <span className='action-content'>{action.content}</span>}
            </Button>
        </Tooltip>
    );
};
