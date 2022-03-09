import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import Rectangle from 'cesium/Source/Core/Rectangle';
import Event from 'cesium/Source/Core/Event';

import { ITileLayerRenderer, TileLayerRendererConfig, TileSource } from '@oidajs/core';

import { cesiumTileSourcesFactory } from './tilesources/cesium-tilesources-factory';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer extends CesiumMapLayer implements ITileLayerRenderer {
    protected onTileLoadStart_: (() => void) | undefined;
    protected onTileLoadEnd_: (() => void) | undefined;
    protected extent_: number[] | undefined;
    protected minZoomLevel_: number | undefined;
    protected maxZoomLevel_: number | undefined;
    protected sourceConfig_: TileSource | undefined;

    protected source_;

    constructor(config: TileLayerRendererConfig) {
        super(config);

        this.onTileLoadStart_ = config.onTileLoadStart;
        this.onTileLoadEnd_ = config.onTileLoadEnd;

        this.extent_ = config.extent;
        this.minZoomLevel_ = config.minZoomLevel;
        this.maxZoomLevel_ = config.maxZoomLevel;

        this.updateSource(config.source);
    }

    updateSource(sourceConfig: TileSource | undefined) {
        if (this.source_) {
            this.source_.tileLoadStartEvent.removeEventListener(this.onTileLoadStart_, this);
            this.source_.tileLoadEndEvent.removeEventListener(this.onTileLoadEnd_, this);
        }

        this.imageries_.removeAll(false);
        this.source_ = undefined;

        try {
            const source = sourceConfig ? cesiumTileSourcesFactory.create(sourceConfig.id, sourceConfig) : undefined;
            if (source) {
                source.tileLoadStartEvent = new Event();
                source.tileLoadEndEvent = new Event();

                // wrap source requestImage to track tile requests
                const originalRequestImage = source.requestImage;
                source.requestImage = function (...args) {
                    const request = originalRequestImage.apply(this, args);
                    if (request) {
                        this.tileLoadStartEvent.raiseEvent();
                        request.then(
                            () => {
                                this.tileLoadEndEvent.raiseEvent();
                            },
                            () => {
                                this.tileLoadEndEvent.raiseEvent();
                            }
                        );
                    }
                    return request;
                };
                source.tileLoadStartEvent.addEventListener(this.onTileLoadStart_, this);
                source.tileLoadEndEvent.addEventListener(this.onTileLoadEnd_, this);

                this.imageries_.add(new ImageryLayer(source, this.getLayerOptions_()));
            }

            this.source_ = source;
        } catch (e) {
            // do nothing
        }

        this.sourceConfig_ = sourceConfig;
    }

    forceRefresh() {
        //TODO: check how to refresh the images without recreating the imagerylayer
        //investigate about this.source_._reload() defined in GlobeSurfaceTileProvider.prototype._onLayerAdded
        this.updateSource(this.sourceConfig_);
    }

    setExtent(extent: number[] | undefined) {
        this.extent_ = extent;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    setMinZoomLevel(level: number | undefined) {
        this.minZoomLevel_ = level;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    setMaxZoomLevel(level: number | undefined) {
        this.maxZoomLevel_ = level;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    protected getLayerOptions_() {
        const options: Record<string, any> = {};
        if (this.extent_) {
            options.rectangle = Rectangle.fromDegrees(...this.extent_);
        }
        if (this.minZoomLevel_ !== undefined) {
            options.minimumTerrainLevel = this.minZoomLevel_;
        }
        if (this.maxZoomLevel_ !== undefined) {
            options.maximumTerrainLevel = this.maxZoomLevel_;
        }
        return options;
    }
}
