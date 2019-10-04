import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import Rectangle from 'cesium/Source/Core/Rectangle';

import { TILE_LAYER_ID } from '@oida/core';

import { cesiumTileSourcesFactory } from './tilesources/cesium-tilesources-factory';

import { cesiumLayersFactory } from './cesium-layers-factory';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer  extends CesiumMapLayer {

    protected onTileLoadStart_;
    protected onTileLoadEnd_;
    protected source_;
    protected extent_;


    constructor(config) {
        super(config);

        this.onTileLoadStart_ = () => {
            config.onTileLoadStart();
        };

        this.onTileLoadEnd_ = () => {
            config.onTileLoadEnd();
        };

        this.extent_ = config.mapLayer.extent;

        this.updateSource(config.mapLayer.source);

    }

    updateSource(config) {
        this.imageries_.removeAll(false);
        try {
            let source = cesiumTileSourcesFactory.create(config.id, config);
            if (source) {

                let onTileLoadStart = this.onTileLoadStart_;
                let onTileLoadEnd = this.onTileLoadEnd_;

                // wrap source requestImage to track tile requests
                let originalRequestImage = source.requestImage;
                source.requestImage = function() {
                    let request = originalRequestImage.apply(this, arguments);
                    if (request) {
                        onTileLoadStart();
                        request.then(() => {
                            onTileLoadEnd();
                        }, () => {
                            onTileLoadEnd();
                        });
                    }
                    return request;
                };

                this.imageries_.add(new ImageryLayer(source, this.getLayerOptions_()));

                this.source_ = source;
            }
        } catch (e) {

        }
    }

    setExtent(extent) {
        this.extent_ = extent;
        this.imageries_.removeAll(false);
        this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
    }

    protected getLayerOptions_() {
        let options: any = {};
        if (this.extent_) {
            options.rectangle = Rectangle.fromDegrees(...this.extent_);
        }
        return options;
    }

}

cesiumLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new CesiumTileLayer(config);
});
