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

    moveLayer(layer: CesiumMapLayer, prevIdx: number, newIdx: number) {
        const moveOffset = newIdx - prevIdx;
        if (moveOffset > 0) {
            for (let i = 0; i < moveOffset; ++i) {
                this.primitives_.raise(layer.getPrimitives());
                this.dataSources_.raise(layer.getDataSources());
                this.imageries_.raise(layer.getImageries());
            }
        } else {
            for (let i = moveOffset; i < 0; ++i) {
                this.primitives_.lower(layer.getPrimitives());
                this.dataSources_.lower(layer.getDataSources());
                this.imageries_.lower(layer.getImageries());
            }
        }
        this.mapRenderer_.refreshImageriesFromEvent({
            type: 'order',
            collection: this.imageries_
        });
    }
}
