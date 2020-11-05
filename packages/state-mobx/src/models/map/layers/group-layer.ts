import { GROUP_LAYER_ID } from '@oida/core';

import { IndexedCollection } from '../../core';
import { MapLayer, MapLayerProps } from './map-layer';

export type GroupLayerProps = {
    children?: Array<MapLayer | MapLayerProps>
} & Omit<MapLayerProps, 'layerType'>;

export class GroupLayer extends MapLayer {

    children: IndexedCollection<MapLayer>;

    constructor(props: GroupLayerProps) {
        super({
            ...props,
            layerType: GROUP_LAYER_ID
        });

        this.children = new IndexedCollection({
            idGetter: (mapLayer) => mapLayer.id,
            items: (props.children || []).map((item) => item instanceof MapLayer ? item : MapLayer.create(item))
        });
    }
}

MapLayer.register(GROUP_LAYER_ID, GroupLayer);
