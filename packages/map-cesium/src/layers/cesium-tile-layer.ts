import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import Rectangle from 'cesium/Source/Core/Rectangle';

import { TILE_LAYER_ID } from '@oida/core';

import { cesiumTileSourcesFactory } from './tilesources/cesium-tilesources-factory';

import { cesiumLayersFactory } from './cesium-layers-factory';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer  extends CesiumMapLayer {

    constructor(config) {
        super(config);

        try {
            let source = cesiumTileSourcesFactory.create(config.mapLayer.source.id, config.mapLayer.source);
            if (source) {
                this.imageries_.add(new ImageryLayer(source));
            }
        } catch (e) {

        }
    }

    updateSource(config) {
        this.imageries_.removeAll(false);
        try {
            let source = cesiumTileSourcesFactory.create(config.id, config);
            if (source) {
                let options: any = {};
                if (config.extent) {
                    options.rectangle = Rectangle.fromDegrees(...config.extent);
                }
                this.imageries_.add(new ImageryLayer(source));
            }
        } catch (e) {

        }
    }

}

cesiumLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new CesiumTileLayer(config);
});
