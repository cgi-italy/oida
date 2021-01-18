import React from 'react';
import classnames from 'classnames';
import { Descriptions } from 'antd';
import {
    LoadingOutlined, PictureFilled
} from '@ant-design/icons';

import { AsyncImage } from '@oida/ui-react-core';


export type DatasetCollectionListItemMeta = {
    label: React.ReactNode,
    value: React.ReactNode
};

export type DatasetCollectionListItemProps = {
    title: React.ReactNode;
    preview?: string | Promise<string>;
    icon?: React.ReactNode;
    metadata?: DatasetCollectionListItemMeta[];
    className?: string
};

export function DataCollectionDetailedListItem(props: DatasetCollectionListItemProps) {

    const metadata = props.metadata?.map((item, idx) => {
        return <Descriptions.Item key={idx} label={item.label}>{item.value}</Descriptions.Item>;
    });

    return (
        <div
            className={classnames('data-collection-list-item-detailed', props.className)}
        >
            <div className='data-collection-list-item-detailed-title'
                title={typeof(props.title) === 'string' ? props.title : ''}
            >
                {props.title}
            </div>
            <div className='data-collection-list-item-detailed-content'>
                <Descriptions
                    className={'data-collection-list-item-detailed-meta'}
                    column={1}
                    size={'small'}
                >
                    {metadata}
                </Descriptions>
                {props.preview && <div className='data-collection-list-item-detailed-preview'>
                    <AsyncImage
                        imageUrl={props.preview}
                        errorContent={<PictureFilled />}
                        loadingContent={<LoadingOutlined />}
                    />
                </div>}
            </div>
        </div>
    );
}

export function DataCollectionCompactListItem(props: DatasetCollectionListItemProps) {

    const metadata = props.metadata?.map((item, idx) => {
        return (
            <div className='data-collection-compact-list-item-meta' key={idx}>
                <span>{item.label}:</span>
                <span>{item.value}</span>
            </div>
        );
    });

    return (
        <div
            className={classnames('data-collection-compact-list-item', props.className)}
        >
            {props.icon && !props.preview &&
                <div className='data-collection-compact-list-item-icon'>{props.icon}</div>
            }
            {props.preview &&
                <div className='data-collection-compact-list-item-preview'>
                    <AsyncImage
                        imageUrl={props.preview}
                        errorContent={<PictureFilled />}
                        loadingContent={<LoadingOutlined />}
                    />
                </div>
            }
            <div className='data-collection-compact-list-item-content'>
                <div className='data-collection-compact-list-item-title'>
                    {props.title}
                </div>
                {metadata}
            </div>
        </div>
    );
}
