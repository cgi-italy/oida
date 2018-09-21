import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';

import { TILE_LAYER_ID } from '@cgi-eo/map-core';

import { cesiumTileSourcesFactory } from './tilesources/cesium-tilesources-factory';

import { cesiumLayersFactory } from './cesium-layers-factory';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer  extends CesiumMapLayer {

    constructor(config) {
        super(config);

        let source = cesiumTileSourcesFactory.create(config.mapLayer.source.id, config.mapLayer.source);
        if (source) {
            this.imageries_.add(new ImageryLayer(source));
        }
    }

    updateSource(config) {
        this.imageries_.removeAll(false);
        let source = cesiumTileSourcesFactory.create(config.source.id, config.source);
        if (source) {
            this.imageries_.add(new ImageryLayer(source));
        }
    }

}

cesiumLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new CesiumTileLayer(config);
});
