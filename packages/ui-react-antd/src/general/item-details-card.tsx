import React from 'react';
import useResizeAware from 'react-resize-aware';
import { Descriptions } from 'antd';
import { LoadingOutlined, PictureFilled } from '@ant-design/icons';

import { AsyncImage, DataCollectionItemAction } from '@oidajs/ui-react-core';

import { DataCollectionItemActionButton } from '../data-collection/data-collection-item-action-button';

export type ItemDetailsCardMetadata = {
    label: React.ReactNode;
    value: React.ReactNode;
};

export type ItemDetailsCardProps = {
    title: React.ReactNode;
    videoPreview?: string;
    imagePreview?: string;
    icon?: React.ReactNode;
    metadata?: ItemDetailsCardMetadata[];
    actions?: DataCollectionItemAction[];
    className?: string;
    maxColumnWidth?: number;
};

export const ItemDetailsCard = (props: ItemDetailsCardProps) => {
    const [resizeListener, size] = useResizeAware();

    let cardPreview: JSX.Element | undefined;
    if (props.videoPreview) {
        cardPreview = (
            <video
                poster={props.imagePreview}
                controls={true}
                onEnded={(evt) => (evt.currentTarget.currentTime = 0)}
                src={props.videoPreview}
            />
        );
    } else if (props.imagePreview) {
        cardPreview = <AsyncImage imageUrl={props.imagePreview} errorContent={<PictureFilled />} loadingContent={<LoadingOutlined />} />;
    }

    const metaItems = (props.metadata || []).map((meta, idx) => {
        return (
            <Descriptions.Item key={idx} label={meta.label}>
                {meta.value}
            </Descriptions.Item>
        );
    });

    const actionItems = (props.actions || []).map((action, idx) => {
        return <DataCollectionItemActionButton key={idx} action={action} type='default' size='middle' />;
    });

    let numColumns = 1;
    if (props.maxColumnWidth) {
        numColumns = Math.floor(size.width / props.maxColumnWidth);
    }

    return (
        <div className='item-details-card'>
            <div className='item-details-card-title'>{props.title}</div>
            <div className='item-details-card-content'>
                <div className='item-details-card-meta-container'>
                    {resizeListener}
                    <Descriptions className='item-details-card-meta' size='small' column={numColumns}>
                        {metaItems}
                    </Descriptions>
                </div>
                <div className='item-details-card-preview'>{cardPreview}</div>
            </div>
            <div className='item-details-card-actions'>{actionItems}</div>
        </div>
    );
};
