import React from 'react';

import { Descriptions, Tooltip } from 'antd';

export type DatasetSearchResultsItemProps = {
    title?: React.ReactNode;
    metadata: Array<{
        label: React.ReactNode;
        description?: string;
        value: React.ReactNode;
    }>;
    actions?: Array<{
        title: React.ReactNode;
        description?: string;
        callback: () => void;
    }>;
    style?: React.CSSProperties;
};

export const DatasetSearchResultsItem = (props: DatasetSearchResultsItemProps) => {

    let { title, metadata, style } = props;

    let items = metadata.map((m, idx) => {
        return <Descriptions.Item
            key={idx}
            label={m.label}
        >
            <Tooltip title={m.description}>{m.value as React.ReactElement}</Tooltip>
        </Descriptions.Item>;
    });

    return (
        <Descriptions size='small' style={style} column={1} title={title}>
            {items}
        </Descriptions>
    );
};

