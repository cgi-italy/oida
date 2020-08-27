import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import Rectangle from 'cesium/Source/Core/Rectangle';
import Event from 'cesium/Source/Core/Event';

import { ITileLayerRenderer } from '@oida/core';

import { cesiumTileSourcesFactory } from './tilesources/cesium-tilesources-factory';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer extends CesiumMapLayer implements ITileLayerRenderer {

    protected onTileLoadStart_;
    protected onTileLoadEnd_;
    protected source_;
    protected extent_;
    protected sourceConfig_;


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

        if (this.source_) {
            this.source_.tileLoadStartEvent.removeEventListener(this.onTileLoadStart_, this);
            this.source_.tileLoadEndEvent.removeEventListener(this.onTileLoadEnd_, this);
        }

        this.imageries_.removeAll(false);
        this.source_ = undefined;

        try {
            let source = config ? cesiumTileSourcesFactory.create(config.id, config) : undefined;
            if (source) {

                source.tileLoadStartEvent = new Event();
                source.tileLoadEndEvent = new Event();

                // wrap source requestImage to track tile requests
                let originalRequestImage = source.requestImage;
                source.requestImage = function() {
                    let request = originalRequestImage.apply(this, arguments);
                    if (request) {
                        this.tileLoadStartEvent.raiseEvent();
                        request.then(() => {
                            this.tileLoadEndEvent.raiseEvent();
                        }, () => {
                            this.tileLoadEndEvent.raiseEvent();
                        });
                    }
                    return request;
                };
                source.tileLoadStartEvent.addEventListener(this.onTileLoadStart_, this);
                source.tileLoadEndEvent.addEventListener(this.onTileLoadEnd_, this);

                this.imageries_.add(new ImageryLayer(source, this.getLayerOptions_()));
            }

            this.source_ = source;
        } catch (e) {

        }

        this.sourceConfig_ = config;
    }

    forceRefresh() {
        //TODO: check how to refresh the images without recreating the imagerylayer
        //investigate about this.source_._reload() defined in GlobeSurfaceTileProvider.prototype._onLayerAdded
        this.updateSource(this.sourceConfig_);
    }

    setExtent(extent) {
        this.extent_ = extent;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    protected getLayerOptions_() {
        let options: any = {};
        if (this.extent_) {
            options.rectangle = Rectangle.fromDegrees(...this.extent_);
        }
        return options;
    }

}
