import { IGroupLayerRenderer, MapLayerRendererConfig } from '@oidajs/core';

import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumGroupLayer extends CesiumMapLayer implements IGroupLayerRenderer {
    constructor(config: MapLayerRendererConfig) {
        super(config);
    }

    addLayer(layer: CesiumMapLayer, idx?: number) {
        layer.setParent(this);

        const layerImageries = layer.getImageries();

        this.imageries_.add(layerImageries, idx);
        this.primitives_.add(layer.getPrimitives());
        this.dataSources_.add(layer.getDataSources());
    }

    removeLayer(layer: CesiumMapLayer) {
        const layerImageries = layer.getImageries();

        this.primitives_.remove(layer.getPrimitives());
        this.dataSources_.remove(layer.getDataSources());
        this.imageries_.remove(layerImageries, false);

        layer.setParent(null);
    }
}
