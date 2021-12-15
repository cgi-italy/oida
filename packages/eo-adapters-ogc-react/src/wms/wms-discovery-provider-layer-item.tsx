import React, { useMemo } from 'react';

import { DataCollectionDetailedListItem } from '@oidajs/ui-react-antd';
import { WmsDatasetDiscoveryProviderItem, WmsLayerPreviewMode } from '@oidajs/eo-adapters-ogc';

export type WmsDiscoveryProviderLayerItemProps = {
    wmsDiscoveryItem: WmsDatasetDiscoveryProviderItem
};

export const WmsDiscoveryProviderLayerItem = (props: WmsDiscoveryProviderLayerItemProps) => {

    const layerPreview = useMemo(() => {

        const layer = props.wmsDiscoveryItem.layer;

        let preview: Promise<string> | undefined;

        if (props.wmsDiscoveryItem.service && layer.Name && !props.wmsDiscoveryItem.disablePreview) {
            preview = props.wmsDiscoveryItem.service.getLayerPreview(layer.Name, {
                width: 128,
                mode: WmsLayerPreviewMode.KeepRatio,
                transparent: true
            });
        }

        return preview;
    }, []);

    return (
        <DataCollectionDetailedListItem
            description={props.wmsDiscoveryItem.layer.Abstract}
            maxDescriptionRows={4}
            preview={layerPreview}
            title={props.wmsDiscoveryItem.layer.Title || props.wmsDiscoveryItem.layer.Name}
        />
    );
};
