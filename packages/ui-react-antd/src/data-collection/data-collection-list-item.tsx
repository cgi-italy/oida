import React, { useState } from 'react';
import classnames from 'classnames';
import { Descriptions, Typography } from 'antd';
import {
    LoadingOutlined, PictureFilled
} from '@ant-design/icons';

import { AsyncImage } from '@oida/ui-react-core';


type ExpandableDescriptionProps = {
    description: React.ReactNode;
    maxRows?: number;
    className?: string;
};

const ExpandableDescription = (props: ExpandableDescriptionProps) => {

    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    return (
        <React.Fragment>
            {!descriptionExpanded &&
                <Typography.Paragraph
                    title={typeof(props.description) === 'string' ? props.description : undefined}
                    className={classnames('data-collection-list-item-description', props.className)}
                    type='secondary'
                    ellipsis={{
                        expandable: true,
                        rows: props.maxRows || 2,
                        symbol: 'more',
                        onExpand: () => setDescriptionExpanded(true)
                    }}
                >
                    {props.description}
                </Typography.Paragraph>
            }
            {descriptionExpanded &&
                <Typography.Paragraph
                    className={classnames('data-collection-list-item-description', props.className)}
                    type='secondary'
                    ellipsis={false}
                >
                    {props.description}
                    <a className='compress-link' onClick={() => setDescriptionExpanded(false)}>
                        less
                    </a>
                </Typography.Paragraph>
            }
        </React.Fragment>
    );
};

export type DatasetCollectionListItemMeta = {
    label: React.ReactNode,
    value: React.ReactNode
};

export type DatasetCollectionListItemProps = {
    title: React.ReactNode;
    preview?: string | Promise<string>;
    icon?: React.ReactNode;
    metadata?: DatasetCollectionListItemMeta[];
    description?: React.ReactNode;
    className?: string
    maxDescriptionRows?: number;
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
            <ExpandableDescription
                description={props.description}
                maxRows={props.maxDescriptionRows}
                className='data-collection-list-item-detailed-description'
            />
            <div className='data-collection-list-item-detailed-content'>
                <Descriptions
                    className={'data-collection-list-item-detailed-meta'}
                    column={props.preview ? 1 : 2}
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
                {item.label && <span>{item.label}:</span>}
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
                <ExpandableDescription
                    description={props.description}
                    maxRows={props.maxDescriptionRows}
                    className='data-collection-compact-list-item-description'
                />
                {metadata}
            </div>
        </div>
    );
}
