import React, { useMemo } from 'react';

import { Tooltip } from 'antd';
import { PictureOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { DataCollectionDetailedListItem } from '@oida/ui-react-antd';
import { WmsDatasetDiscoveryProviderItem, WmsLayerPreviewMode } from '@oida/eo-adapters-ogc';

export type WmsDiscoveryProviderLayerItemProps = {
    wmsDiscoveryItem: WmsDatasetDiscoveryProviderItem
};

export const WmsDiscoveryProviderLayerItem = (props: WmsDiscoveryProviderLayerItemProps) => {

    const layerData = useMemo(() => {

        const meta: any[] = [];

        const layer = props.wmsDiscoveryItem.layer;

        if (layer.Title) {
            meta.push({
                label: (
                    <Tooltip title='Source name'>
                        <PictureOutlined />
                    </Tooltip>
                ),
                value: layer.Title
            });
        }

        if (layer.Abstract) {
            meta.push({
                label: (
                    <Tooltip title='Description'>
                        <InfoCircleOutlined />
                    </Tooltip>
                ),
                value: layer.Abstract
            });
        }

        let preview: Promise<string> | undefined;

        if (props.wmsDiscoveryItem.service && layer.Name && !props.wmsDiscoveryItem.disablePreview) {
            preview = props.wmsDiscoveryItem.service.getLayerPreview(layer.Name, {
                width: 128,
                mode: WmsLayerPreviewMode.KeepRatio,
                transparent: true
            });
        }

        return {
            metadata: meta,
            preview: preview
        };

    }, []);

    return (
        <DataCollectionDetailedListItem
            metadata={layerData.metadata}
            preview={layerData.preview}
            title={props.wmsDiscoveryItem.layer.Name}
        />
    );
};
