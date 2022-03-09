import Group from 'ol/layer/Group';

import { GROUP_LAYER_ID, IGroupLayerRenderer, MapLayerRendererConfig } from '@oidajs/core';

import { OLMapLayer } from './ol-map-layer';
import { olLayersFactory } from './ol-layers-factory';

export class OLGroupLayer extends OLMapLayer<Group> implements IGroupLayerRenderer {
    constructor(config: MapLayerRendererConfig) {
        super(config);
    }

    addLayer(layer: OLMapLayer, position?: number) {
        if (typeof position === 'number') {
            this.olImpl_.getLayers().insertAt(position, layer.getOLObject());
        } else {
            this.olImpl_.getLayers().push(layer.getOLObject());
        }
    }

    removeLayer(layer: OLMapLayer) {
        this.olImpl_.getLayers().remove(layer.getOLObject());
    }

    protected createOLObject_(config: MapLayerRendererConfig) {
        return new Group({
            extent: config.extent,
            zIndex: config.zIndex,
            layers: []
        });
    }

    protected destroyOLObject_() {
        this.olImpl_.getLayers().clear();
    }
}

olLayersFactory.register(GROUP_LAYER_ID, (config) => {
    return new OLGroupLayer(config);
});
