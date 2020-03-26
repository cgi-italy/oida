import { IGroupLayerRenderer } from '@oida/core';

import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumGroupLayer extends CesiumMapLayer implements IGroupLayerRenderer {
    constructor(config) {
        super(config);
    }

    addLayer(layer, idx) {

        layer.setParent(this);

        let layerImageries = layer.getImageries();

        this.imageries_.add(layerImageries, idx);
        this.primitives_.add(layer.getPrimitives());
        this.dataSources_.add(layer.getDataSources());

    }

    removeLayer(layer) {

        let layerImageries = layer.getImageries();

        this.primitives_.remove(layer.getPrimitives());
        this.dataSources_.remove(layer.getDataSources());
        this.imageries_.remove(layerImageries, false);

        layer.setParent(null);
    }

}
