import { CesiumMapLayer } from './cesium-map-layer';
import { cesiumLayersFactory } from './cesium-layers-factory';

import { GROUP_LAYER_ID, IGroupLayerRenderer } from '@oida/core';

export class CesiumGroupLayer extends CesiumMapLayer implements IGroupLayerRenderer {
    constructor(config) {
        super(config);
    }

    addLayer(layer, idx) {

        layer.setParent(this);

        let layerImageries = layer.getImageries();

        this.imageries_.add(layerImageries, idx);
        this.primitives_.add(layer.getPrimitives());

    }

    removeLayer(layer) {

        let layerImageries = layer.getImageries();

        this.primitives_.remove(layer.getPrimitives());
        this.imageries_.remove(layerImageries, false);

        layer.setParent(null);
    }

}

cesiumLayersFactory.register(GROUP_LAYER_ID, (config) => {
    return new CesiumGroupLayer(config);
});
