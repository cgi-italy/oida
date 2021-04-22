import { GROUP_LAYER_ID } from '@oida/core';

import { IndexedCollection } from '../../core';
import { MapLayer, MapLayerDefinition, MapLayerProps } from './map-layer';

export type GroupLayerProps = {
    children?: Array<MapLayer | MapLayerDefinition>
} & MapLayerProps<typeof GROUP_LAYER_ID>;

export class GroupLayer extends MapLayer {

    children: IndexedCollection<MapLayer>;

    constructor(props: Omit<GroupLayerProps, 'layerType'>) {
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
